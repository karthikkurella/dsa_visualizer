import type { TraceResponse } from './types'

export async function traceCode(code: string, input: string): Promise<TraceResponse> {
  const response = await fetch('/api/trace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, input }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed (${response.status})`)
  }

  return response.json()
}
