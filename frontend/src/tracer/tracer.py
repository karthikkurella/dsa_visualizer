"""Trace Python code execution and capture step-by-step variable states."""

from __future__ import annotations

import ast
import builtins
import io
import sys
import traceback
from contextlib import redirect_stdout
from dataclasses import dataclass, field
from typing import Any


MAX_STEPS = 2000
EXEC_TIMEOUT_SEC = 5


@dataclass
class TraceStep:
    step: int
    line: int | None
    event: str
    variables: dict[str, str]
    stdout: str
    call_depth: int
    function: str | None = None


@dataclass
class TraceResult:
    success: bool
    steps: list[dict[str, Any]] = field(default_factory=list)
    source_lines: list[str] = field(default_factory=list)
    error: str | None = None
    error_line: int | None = None
    final_stdout: str = ""


def _serialize(value: Any, depth: int = 0) -> str:
    if depth > 3:
        return "..."
    if isinstance(value, (int, float, bool, type(None))):
        return repr(value)
    if isinstance(value, str):
        if len(value) > 120:
            return repr(value[:117] + "...")
        return repr(value)
    if isinstance(value, (list, tuple)):
        if len(value) > 20:
            inner = ", ".join(_serialize(v, depth + 1) for v in value[:20])
            return f"[{inner}, ...] ({len(value)} items)" if isinstance(value, list) else f"({inner}, ...) ({len(value)} items)"
        inner = ", ".join(_serialize(v, depth + 1) for v in value)
        return f"[{inner}]" if isinstance(value, list) else f"({inner})"
    if isinstance(value, dict):
        if len(value) > 15:
            items = list(value.items())[:15]
            inner = ", ".join(f"{_serialize(k, depth + 1)}: {_serialize(v, depth + 1)}" for k, v in items)
            return "{" + inner + f", ...}} ({len(value)} items)"
        inner = ", ".join(f"{_serialize(k, depth + 1)}: {_serialize(v, depth + 1)}" for k, v in value.items())
        return "{" + inner + "}"
    if isinstance(value, set):
        items = list(value)[:15]
        inner = ", ".join(_serialize(v, depth + 1) for v in items)
        suffix = f", ... ({len(value)} items)" if len(value) > 15 else ""
        return "{" + inner + suffix + "}"
    try:
        text = repr(value)
        if len(text) > 160:
            return text[:157] + "..."
        return text
    except Exception:
        return f"<{type(value).__name__}>"


def _collect_variables(frame: Any) -> dict[str, str]:
    skip = {"__builtins__", "__name__", "__doc__", "__package__", "__loader__", "__spec__", "__annotations__"}
    result: dict[str, str] = {}
    for name, value in frame.f_locals.items():
        if name.startswith("__") and name.endswith("__"):
            continue
        if name in skip:
            continue
        try:
            result[name] = _serialize(value)
        except Exception:
            result[name] = "<unable to display>"
    return result


def _validate_code(source: str) -> str | None:
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        return f"Syntax error on line {exc.lineno}: {exc.msg}"

    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            return "Imports are not allowed for security reasons."
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id in {"eval", "exec", "compile", "open", "__import__", "getattr", "globals", "locals"}:
                return f"Disallowed function call: {node.func.id}()"
    return None


class _TypeStub:
    def __getitem__(self, _item: Any) -> _TypeStub:
        return self


def _typing_stubs() -> str:
    return """
class _TypeStub:
    def __getitem__(self, _item):
        return self

List = Dict = Set = Tuple = Optional = _TypeStub()
"""


def _find_solution_method(code: str) -> tuple[str, list[str]] | None:
    tree = ast.parse(code)
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef) and node.name == "Solution":
            for item in node.body:
                if isinstance(item, ast.FunctionDef) and not item.name.startswith("_"):
                    params = [arg.arg for arg in item.args.args if arg.arg != "self"]
                    return item.name, params
    return None


def _prepare_code(source: str, input_text: str) -> tuple[str, str]:
    """Wrap LeetCode Solution classes and merge variable inputs."""
    stripped_input = input_text.strip()

    if "class Solution" in source:
        method_info = _find_solution_method(source)
        if not method_info:
            body = f"{_typing_stubs()}\n{source}"
            return body, stripped_input

        method_name, params = method_info
        call_args = ", ".join(params)
        body = f"""{_typing_stubs()}
{source}

{stripped_input}

_solution = Solution()
_result = _solution.{method_name}({call_args})
print(_result)
"""
        return body, ""

    if stripped_input and "=" in stripped_input:
        return f"{source}\n\n{stripped_input}", ""

    return source, stripped_input


def _safe_builtins() -> dict[str, Any]:
    allowed = {
        "abs", "all", "any", "bin", "bool", "chr", "dict", "enumerate", "filter",
        "float", "format", "frozenset", "hex", "input", "int", "isinstance", "issubclass",
        "len", "list", "map", "max", "min", "oct", "ord", "pow", "print", "range",
        "reversed", "round", "set", "slice", "sorted", "str", "sum", "tuple", "zip",
        "True", "False", "None",
        "__build_class__", "staticmethod", "classmethod", "property", "super",
        "type", "object", "callable", "iter", "next",
        "Exception", "ValueError", "IndexError", "KeyError", "RuntimeError", "AttributeError",
    }
    return {name: getattr(builtins, name) for name in allowed}


def trace_code(source: str, stdin_text: str = "") -> TraceResult:
    validation_error = _validate_code(source)
    if validation_error:
        return TraceResult(success=False, error=validation_error)

    executable, stdin_text = _prepare_code(source, stdin_text)
    source_lines = executable.splitlines()
    steps: list[TraceStep] = []
    stdout_buffer = io.StringIO()
    step_counter = 0
    call_depth = 0
    timed_out = False
    start_time_container: list[float] = []

    def make_trace():
        import time

        def trace_fn(frame: Any, event: str, arg: Any):
            nonlocal step_counter, call_depth, timed_out

            if not start_time_container:
                start_time_container.append(time.monotonic())
            elif time.monotonic() - start_time_container[0] > EXEC_TIMEOUT_SEC:
                timed_out = True
                raise TimeoutError("Execution timed out (5s limit)")

            if step_counter >= MAX_STEPS:
                raise RuntimeError(f"Step limit reached ({MAX_STEPS} steps)")

            filename = frame.f_code.co_filename
            if filename != "<user_code>":
                return trace_fn

            if event == "call":
                call_depth += 1
                return trace_fn

            if event == "return":
                call_depth = max(0, call_depth - 1)
                return trace_fn

            if event == "line":
                step_counter += 1
                steps.append(
                    TraceStep(
                        step=step_counter,
                        line=frame.f_lineno,
                        event=event,
                        variables=_collect_variables(frame),
                        stdout=stdout_buffer.getvalue(),
                        call_depth=call_depth,
                        function=frame.f_code.co_name if frame.f_code.co_name != "<module>" else None,
                    )
                )
            return trace_fn

        return trace_fn

    stdin_buffer = io.StringIO(stdin_text)
    old_stdin = sys.stdin

    globals_dict: dict[str, Any] = {"__builtins__": _safe_builtins()}
    compiled = compile(executable, "<user_code>", "exec")

    try:
        sys.stdin = stdin_buffer
        with redirect_stdout(stdout_buffer):
            sys.settrace(make_trace())
            try:
                exec(compiled, globals_dict, globals_dict)
            finally:
                sys.settrace(None)
    except TimeoutError as exc:
        return TraceResult(
            success=False,
            steps=[s.__dict__ for s in steps],
            source_lines=source_lines,
            error=str(exc),
            final_stdout=stdout_buffer.getvalue(),
        )
    except Exception:
        exc_type, exc_value, exc_tb = sys.exc_info()
        tb_lines = traceback.extract_tb(exc_tb)
        error_line = None
        for entry in reversed(tb_lines):
            if entry.filename == "<user_code>":
                error_line = entry.lineno
                break
        return TraceResult(
            success=False,
            steps=[s.__dict__ for s in steps],
            source_lines=source_lines,
            error=f"{exc_type.__name__}: {exc_value}",
            error_line=error_line,
            final_stdout=stdout_buffer.getvalue(),
        )
    finally:
        sys.stdin = old_stdin

    final_stdout = stdout_buffer.getvalue()
    if steps:
        last = steps[-1]
        if last.stdout != final_stdout or not steps:
            step_counter += 1
            steps.append(
                TraceStep(
                    step=step_counter,
                    line=None,
                    event="end",
                    variables=last.variables,
                    stdout=final_stdout,
                    call_depth=0,
                    function=None,
                )
            )
    elif final_stdout:
        steps.append(
            TraceStep(
                step=1,
                line=None,
                event="end",
                variables={},
                stdout=final_stdout,
                call_depth=0,
            )
        )

    return TraceResult(
        success=True,
        steps=[s.__dict__ for s in steps],
        source_lines=source_lines,
        final_stdout=final_stdout,
    )
