"""Firebase Cloud Function entry point for the DSA visualizer API."""

from __future__ import annotations

import json

from firebase_admin import initialize_app
from firebase_functions import https_fn, options

from tracer import trace_code

initialize_app()


def _json_response(payload: dict, status: int = 200) -> https_fn.Response:
    return https_fn.Response(
        json.dumps(payload),
        status=status,
        mimetype="application/json",
    )


def _normalize_path(path: str) -> str:
    return path.rstrip("/") or "/"


@https_fn.on_request(
    memory=options.MemoryOption.MB_512,
    timeout_sec=60,
    cors=options.CorsOptions(
        cors_origins="*",
        cors_methods=["GET", "POST", "OPTIONS"],
    ),
)
def api(req: https_fn.Request) -> https_fn.Response:
    path = _normalize_path(req.path)

    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)

    if path.endswith("/api/health"):
        return _json_response({"status": "ok"})

    if req.method == "POST" and path.endswith("/api/trace"):
        body = req.get_json(silent=True) or {}
        code = body.get("code", "")
        input_text = body.get("input", "")

        if not code or not isinstance(code, str):
            return _json_response({"error": "code is required"}, status=400)

        if not isinstance(input_text, str):
            return _json_response({"error": "input must be a string"}, status=400)

        result = trace_code(code, input_text)
        return _json_response(
            {
                "success": result.success,
                "steps": result.steps,
                "sourceLines": result.source_lines,
                "error": result.error,
                "errorLine": result.error_line,
                "finalStdout": result.final_stdout,
            }
        )

    return https_fn.Response("Not Found", status=404)
