export interface StackFrame {
  function: string
  line: number | null
  variables: Record<string, string>
}

export interface TraceStep {
  step: number
  line: number | null
  event: string
  variables: Record<string, string>
  stdout: string
  call_depth: number
  function?: string | null
  stack?: StackFrame[]
}

export interface TraceResponse {
  success: boolean
  steps: TraceStep[]
  sourceLines: string[]
  error: string | null
  errorLine: number | null
  finalStdout: string
}

export interface Example {
  name: string
  code: string
  input: string
}
