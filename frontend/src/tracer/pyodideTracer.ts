import { loadPyodide, type PyodideInterface } from 'pyodide'
import tracerSource from './tracer.py?raw'
import type { TraceResponse } from '../types'

const PYODIDE_VERSION = '0.26.4'
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

let pyodidePromise: Promise<PyodideInterface> | null = null
let tracerLoaded = false

async function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodide({ indexURL: PYODIDE_CDN })
  }

  const pyodide = await pyodidePromise

  if (!tracerLoaded) {
    await pyodide.runPythonAsync(tracerSource)
    tracerLoaded = true
  }

  return pyodide
}

export function preloadPythonRuntime(): Promise<void> {
  return getPyodide().then(() => undefined)
}

export function isPythonRuntimeReady(): boolean {
  return tracerLoaded
}

export async function traceCode(code: string, input: string): Promise<TraceResponse> {
  const pyodide = await getPyodide()

  pyodide.globals.set('_user_code', code)
  pyodide.globals.set('_user_input', input)

  const resultJson = await pyodide.runPythonAsync(`
import json

result = trace_code(_user_code, _user_input)
json.dumps({
    "success": result.success,
    "steps": result.steps,
    "sourceLines": result.source_lines,
    "error": result.error,
    "errorLine": result.error_line,
    "finalStdout": result.final_stdout,
})
`)

  return JSON.parse(resultJson) as TraceResponse
}
