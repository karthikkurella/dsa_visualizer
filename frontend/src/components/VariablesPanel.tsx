import type { StackFrame } from '../types'

interface VariablesPanelProps {
  stack: StackFrame[]
}

export function VariablesPanel({ stack }: VariablesPanelProps) {
  if (stack.length === 0) {
    return (
      <div className="panel variables-panel">
        <div className="panel-header">
          <h3>Call Stack</h3>
        </div>
        <div className="panel-body">
          <p className="muted">No stack frames at this step.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel variables-panel">
      <div className="panel-header">
        <h3>Call Stack</h3>
        <span className="badge depth">{stack.length} frame{stack.length === 1 ? '' : 's'}</span>
      </div>
      <div className="panel-body stack-trace">
        {stack.map((frame, index) => (
          <div key={`${frame.function}-${index}`} className={`stack-frame ${index === 0 ? 'current' : ''}`}>
            <div className="stack-frame-header">
              <span className="stack-depth">{stack.length - index}</span>
              <div className="stack-frame-title">
                <span className="stack-fn">{frame.function}</span>
                {frame.line !== null && <span className="stack-line">line {frame.line}</span>}
              </div>
            </div>
            {Object.keys(frame.variables).length > 0 ? (
              <div className="stack-vars">
                {Object.entries(frame.variables).map(([name, value]) => (
                  <div key={name} className="stack-var-row">
                    <span className="var-name">{name}</span>
                    <span className="var-value">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted stack-empty">No local variables</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
