interface CodeViewerProps {
  lines: string[]
  activeLine: number | null
  errorLine: number | null
}

export function CodeViewer({ lines, activeLine, errorLine }: CodeViewerProps) {
  if (lines.length === 0) {
    return (
      <div className="code-viewer empty">
        <p>Run your code to see execution steps here.</p>
      </div>
    )
  }

  return (
    <div className="code-viewer">
      <pre>
        {lines.map((line, index) => {
          const lineNumber = index + 1
          const isActive = activeLine === lineNumber
          const isError = errorLine === lineNumber
          const className = [
            'code-line',
            isActive ? 'active' : '',
            isError ? 'error' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div key={lineNumber} className={className}>
              <span className="line-number">{lineNumber}</span>
              <span className="line-content">{line || ' '}</span>
            </div>
          )
        })}
      </pre>
    </div>
  )
}
