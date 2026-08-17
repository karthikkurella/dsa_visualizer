from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from tracer import trace_code

app = FastAPI(title="DSA Code Visualizer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TraceRequest(BaseModel):
    code: str = Field(..., min_length=1)
    input: str = ""


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/trace")
def trace(request: TraceRequest):
    result = trace_code(request.code, request.input)
    return {
        "success": result.success,
        "steps": result.steps,
        "sourceLines": result.source_lines,
        "error": result.error,
        "errorLine": result.error_line,
        "finalStdout": result.final_stdout,
    }
