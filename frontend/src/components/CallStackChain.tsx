import { useState } from 'react'
import type { StackFrame } from '../types'

interface CallStackChainProps {
  stack: StackFrame[]
  callDepth: number
  currentFunction?: string | null
  hasTrace?: boolean
}

function formatName(frame: StackFrame): string {
  const base = frame.function === 'Global variables'
    ? 'module'
    : frame.function.endsWith('()')
      ? frame.function.replace('()', '')
      : frame.function

  if (frame.recursion && frame.recursion > 1) {
    return `${base} (call ${frame.recursion})`
  }
  return base
}

function collapsedSummary(
  stack: StackFrame[],
  callDepth: number,
  currentFunction?: string | null,
): string {
  if (stack.length > 0) {
    return formatName(stack[0])
  }
  if (currentFunction) {
    return currentFunction
  }
  if (callDepth > 0) {
    return `depth ${callDepth}`
  }
  return 'No active calls'
}

export function CallStackChain({
  stack,
  callDepth,
  currentFunction,
  hasTrace = false,
}: CallStackChainProps) {
  const [open, setOpen] = useState(true)
  const depth = callDepth || stack.length
  const hasStack = stack.length > 0
  const chain = hasStack ? [...stack].reverse() : []

  return (
    <div className="panel call-stack-panel call-stack-sidebar">
      <button
        type="button"
        className="panel-header call-stack-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="call-stack-chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
        <h3>Call Stack</h3>
        {depth > 0 && <span className="badge depth">depth {depth}</span>}
        {!open && (
          <span className="call-stack-collapsed-summary">
            {hasTrace ? collapsedSummary(stack, callDepth, currentFunction) : 'Run to view'}
          </span>
        )}
      </button>

      {open && (
        <div className="panel-body call-stack-body">
          {!hasTrace ? (
            <p className="muted call-stack-empty">Run your code to see the call stack chain.</p>
          ) : !hasStack ? (
            <p className="muted call-stack-empty">
              {currentFunction
                ? `Inside ${currentFunction}() — step forward to see frames.`
                : 'Step through execution to see the call chain.'}
            </p>
          ) : (
            <ol className="stack-vertical-chain" aria-label="Call stack">
              {chain.map((frame, index) => {
                const isCurrent = index === chain.length - 1
                const rank = index + 1

                return (
                  <li
                    key={`${frame.function}-${frame.line}-${index}`}
                    className={`stack-vertical-item ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="stack-vertical-rail">
                      <span className="stack-vertical-rank">{rank}</span>
                      {index < chain.length - 1 && <span className="stack-vertical-line" />}
                    </div>
                    <div className="stack-vertical-content">
                      <div className="stack-vertical-header">
                        <span className="stack-vertical-fn">{formatName(frame)}</span>
                        {frame.line !== null && (
                          <span className="stack-vertical-line-no">:{frame.line}</span>
                        )}
                        {isCurrent && <span className="stack-now-badge">now</span>}
                      </div>
                      {isCurrent && Object.keys(frame.variables).length > 0 && (
                        <div className="stack-vertical-vars">
                          {Object.entries(frame.variables).map(([name, value]) => (
                            <div key={name} className="stack-vertical-var">
                              <span className="stack-var-name">{name}</span>
                              <span className="stack-var-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
