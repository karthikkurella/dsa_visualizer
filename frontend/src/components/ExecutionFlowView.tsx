import { useLayoutEffect, useRef, useState } from 'react'
import type { StackFrame } from '../types'

interface ExecutionFlowViewProps {
  stack: StackFrame[]
  changedKeys: Set<string>
  stdout: string
  hasTrace: boolean
}

interface ArrowPath {
  id: string
  d: string
}

function formatFrameTitle(frame: StackFrame): string {
  if (frame.function === 'Global variables') {
    return 'Global frame'
  }
  const base = frame.function.endsWith('()') ? frame.function : `${frame.function}()`
  if (frame.recursion && frame.recursion > 1) {
    return `${base}  (call ${frame.recursion})`
  }
  return base
}

function formatFrameSubtitle(frame: StackFrame): string {
  if (frame.line !== null) {
    return `line ${frame.line}`
  }
  return frame.label ?? ''
}

export function ExecutionFlowView({
  stack,
  changedKeys,
  stdout,
  hasTrace,
}: ExecutionFlowViewProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const frameRefs = useRef<(HTMLDivElement | null)[]>([])
  const [arrows, setArrows] = useState<ArrowPath[]>([])

  const frames = stack.length > 0 ? [...stack].reverse() : []

  useLayoutEffect(() => {
    const updateArrows = () => {
      const canvas = canvasRef.current
      if (!canvas || stack.length < 2) {
        setArrows([])
        return
      }

      const ordered = [...stack].reverse()
      const canvasRect = canvas.getBoundingClientRect()
      const nextArrows: ArrowPath[] = []

      for (let index = 0; index < ordered.length - 1; index += 1) {
        const fromEl = frameRefs.current[index]
        const toEl = frameRefs.current[index + 1]
        if (!fromEl || !toEl) continue

        const fromRect = fromEl.getBoundingClientRect()
        const toRect = toEl.getBoundingClientRect()

        const x1 = fromRect.right - canvasRect.left
        const y1 = fromRect.top - canvasRect.top + fromRect.height / 2
        const x2 = toRect.left - canvasRect.left
        const y2 = toRect.top - canvasRect.top + toRect.height / 2

        const dx = Math.max(40, (x2 - x1) * 0.55)
        const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`

        nextArrows.push({
          id: `${ordered[index].function}-${ordered[index + 1].function}-${index}`,
          d,
        })
      }

      setArrows(nextArrows)
    }

    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [stack])

  if (!hasTrace) {
    return (
      <div className="pt-canvas pt-canvas-empty">
        <p>Run your code to visualize execution frames, call flow, and print output.</p>
      </div>
    )
  }

  return (
    <div className="pt-flow">
      <div className="pt-canvas" ref={canvasRef}>
        {arrows.length > 0 && (
          <svg className="pt-arrows" aria-hidden="true">
            <defs>
              <marker
                id="pt-arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#4a9eff" />
              </marker>
            </defs>
            {arrows.map((arrow) => (
              <path
                key={arrow.id}
                d={arrow.d}
                className="pt-arrow-path"
                markerEnd="url(#pt-arrowhead)"
              />
            ))}
          </svg>
        )}

        <div className="pt-frames-row">
          {frames.length === 0 ? (
            <div className="pt-frame pt-frame-placeholder">
              <div className="pt-frame-title">No frames yet</div>
              <p className="muted">Step forward to enter a function.</p>
            </div>
          ) : (
            frames.map((frame, index) => {
              const isCurrent = index === frames.length - 1
              const entries = Object.entries(frame.variables)

              return (
                <div
                  key={`${frame.function}-${frame.line}-${index}`}
                  ref={(el) => {
                    frameRefs.current[index] = el
                  }}
                  className={`pt-frame ${isCurrent ? 'current' : ''}`}
                >
                  <div className="pt-frame-header">
                    <div className="pt-frame-title">{formatFrameTitle(frame)}</div>
                    <div className="pt-frame-subtitle">{formatFrameSubtitle(frame)}</div>
                    {isCurrent && <span className="pt-now-pill">executing</span>}
                  </div>
                  {entries.length > 0 ? (
                    <table className="pt-var-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map(([name, value]) => (
                          <tr
                            key={name}
                            className={isCurrent && changedKeys.has(name) ? 'changed' : ''}
                          >
                            <td className="pt-var-name">{name}</td>
                            <td className="pt-var-value">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="muted pt-no-vars">no local variables</p>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="pt-output-panel">
        <div className="pt-output-label">Program output</div>
        <pre className="pt-output-text">{stdout || '(no output yet)'}</pre>
      </div>
    </div>
  )
}
