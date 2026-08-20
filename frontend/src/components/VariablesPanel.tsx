import { useState } from 'react'
import type { StackFrame } from '../types'

interface VariablesPanelProps {
  stack: StackFrame[]
}

function formatFunctionName(frame: StackFrame): string {
  if (frame.function === 'Global variables') return 'Global variables'
  const base = frame.function.endsWith('()') ? frame.function : `${frame.function}()`
  if (frame.recursion && frame.recursion > 1) {
    return `${base} (call ${frame.recursion})`
  }
  return base
}

function VariableList({ variables }: { variables: Record<string, string> }) {
  const entries = Object.entries(variables)
  if (entries.length === 0) {
    return <p className="muted vars-empty">No variables here</p>
  }

  return (
    <div className="var-list">
      {entries.map(([name, value]) => (
        <div key={name} className="var-card">
          <span className="var-card-name">{name}</span>
          <span className="var-card-value">{value}</span>
        </div>
      ))}
    </div>
  )
}

function FrameBlock({
  frame,
  emphasized = false,
}: {
  frame: StackFrame
  emphasized?: boolean
}) {
  return (
    <div className={`frame-block ${emphasized ? 'emphasized' : ''}`}>
      <div className="frame-heading">
        <span className="frame-label">{frame.label ?? (emphasized ? 'Right now' : 'Called from')}</span>
        <span className="frame-fn">{formatFunctionName(frame)}</span>
        {frame.line !== null && <span className="frame-line">line {frame.line}</span>}
      </div>
      <VariableList variables={frame.variables} />
    </div>
  )
}

export function VariablesPanel({ stack }: VariablesPanelProps) {
  const [showParents, setShowParents] = useState(true)

  if (stack.length === 0) {
    return (
      <div className="panel variables-panel">
        <div className="panel-header">
          <h3>Variables</h3>
        </div>
        <div className="panel-body">
          <p className="muted">Run your code to inspect variables.</p>
        </div>
      </div>
    )
  }

  const current = stack[0]
  const parents = stack.slice(1)

  return (
    <div className="panel variables-panel">
      <div className="panel-header">
        <h3>Variables</h3>
        {parents.length > 0 && (
          <button type="button" className="toggle-parents" onClick={() => setShowParents((v) => !v)}>
            {showParents ? 'Hide callers' : 'Show callers'}
          </button>
        )}
      </div>
      <div className="panel-body vars-layout">
        <FrameBlock frame={current} emphasized />

        {parents.length > 0 && showParents && (
          <div className="parent-section">
            <div className="parent-divider">
              <span>↑ where this was called from</span>
            </div>
            {parents.map((frame, index) => (
              <FrameBlock key={`${frame.function}-${frame.line}-${index}`} frame={frame} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
