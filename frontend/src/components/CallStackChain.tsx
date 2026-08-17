import { useState } from 'react'
import type { StackFrame } from '../types'

interface CallStackChainProps {
  stack: StackFrame[]
  callDepth: number
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

function chainSummary(stack: StackFrame[]): string {
  return [...stack]
    .reverse()
    .map(formatName)
    .join(' → ')
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

export function CallStackChain({ stack, callDepth }: CallStackChainProps) {
  if (stack.length === 0) {
    return null
  }

  const chain = [...stack].reverse()
  const currentFrame = stack[0]
  const depth = callDepth || stack.length

  return (
    <div className="call-stack-area">
      <CollapsibleSection
        id="call-chain-panel"
        title="Call chain"
        summary={chainSummary(stack)}
        defaultOpen
      >
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
      </CollapsibleSection>

      <CollapsibleSection
        id="stack-depth-panel"
        title="Stack depth"
        summary={`depth ${depth} · ${formatName(currentFrame)}`}
      >
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
      </CollapsibleSection>
    </div>
  )
}
