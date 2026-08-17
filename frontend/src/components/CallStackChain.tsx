import { useState } from 'react'
import type { StackFrame } from '../types'

interface CallStackChainProps {
  stack: StackFrame[]
  callDepth: number
  currentFunction?: string | null
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

function chainSummary(stack: StackFrame[], callDepth: number, currentFunction?: string | null): string {
  if (stack.length > 0) {
    return [...stack].reverse().map(formatName).join(' → ')
  }
  if (currentFunction) {
    return `module → ${currentFunction}`
  }
  if (callDepth > 0) {
    return `depth ${callDepth}`
  }
  return 'No active calls'
}

interface CollapsibleSectionProps {
  id: string
  title: string
  summary: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function CollapsibleSection({
  id,
  title,
  summary,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={`collapsible-section ${open ? 'open' : 'closed'}`}>
      <button
        type="button"
        className="collapsible-header"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="collapsible-chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
        <span className="collapsible-title">{title}</span>
        {!open && <span className="collapsible-summary">{summary}</span>}
      </button>
      {open && (
        <div id={id} className="collapsible-body">
          {children}
        </div>
      )}
    </section>
  )
}

export function CallStackChain({ stack, callDepth, currentFunction }: CallStackChainProps) {
  const depth = callDepth || stack.length
  const hasStack = stack.length > 0
  const currentFrame = stack[0]
  const chain = hasStack ? [...stack].reverse() : []
  const summary = chainSummary(stack, callDepth, currentFunction)

  return (
    <div className="call-stack-area">
      <CollapsibleSection
        id="call-chain-panel"
        title="Call chain"
        summary={summary}
        defaultOpen
      >
        {hasStack ? (
          <div className="chain-breadcrumb" aria-label="Call chain">
            {chain.map((frame, index) => (
              <span key={`${frame.function}-${index}`} className="chain-crumb-wrap">
                {index > 0 && <span className="chain-arrow">→</span>}
                <span className={`chain-crumb ${index === chain.length - 1 ? 'current' : ''}`}>
                  {formatName(frame)}
                  {frame.line !== null && <span className="chain-line">:{frame.line}</span>}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="muted call-stack-empty">
            {currentFunction
              ? `Inside ${currentFunction}() — step forward to see the full call chain.`
              : 'Step through execution to see how functions call each other.'}
          </p>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        id="stack-depth-panel"
        title="Stack depth"
        summary={hasStack ? `depth ${depth} · ${formatName(currentFrame)}` : `depth ${depth}`}
        defaultOpen={depth > 1}
      >
        {hasStack ? (
          <div className="stack-outline">
            {stack.map((frame, index) => {
              const isCurrent = index === 0
              const isLast = index === stack.length - 1
              const frameDepth = stack.length - index

              return (
                <div
                  key={`${frame.function}-${frame.line}-${index}`}
                  className={`stack-node ${isCurrent ? 'current' : ''}`}
                >
                  <div className="stack-node-line">
                    {!isLast && <span className="stack-connector" />}
                    <span className="stack-depth-badge">{frameDepth}</span>
                    <div className="stack-node-card">
                      <div className="stack-node-header">
                        <span className="stack-node-fn">{formatName(frame)}</span>
                        {frame.line !== null && (
                          <span className="stack-node-line-no">line {frame.line}</span>
                        )}
                        {isCurrent && <span className="stack-now-badge">now</span>}
                      </div>
                      {Object.keys(frame.variables).length > 0 ? (
                        <div className="stack-node-vars">
                          {Object.entries(frame.variables).map(([name, value]) => (
                            <div key={name} className="stack-node-var">
                              <span className="stack-var-name">{name}</span>
                              <span className="stack-var-eq">=</span>
                              <span className="stack-var-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="muted stack-node-empty">no locals</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="muted call-stack-empty">
            {callDepth > 0
              ? `Call depth is ${callDepth}. Step forward to inspect variables at each level.`
              : 'No stack frames yet.'}
          </p>
        )}
      </CollapsibleSection>
    </div>
  )
}
