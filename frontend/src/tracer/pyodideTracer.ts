import type { TraceResponse } from '../types'
import tracerSource from './tracer.py?raw'

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'

type PyodideInterface = Awaited<ReturnType<typeof import('pyodide')['loadPyodide']>>

let pyodidePromise: Promise<PyodideInterface> | null = null

async function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const { loadPyodide } = await import('pyodide')
      const pyodide = await loadPyodide({ indexURL: PYODIDE_CDN })
      await pyodide.runPythonAsync(tracerSource)
      return pyodide
    })()
  }
  return pyodidePromise
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
