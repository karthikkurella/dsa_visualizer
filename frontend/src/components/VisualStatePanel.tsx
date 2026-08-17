import {
  formatCellValue,
  isArrayValue,
  parsePythonValue,
  type ParsedValue,
} from '../utils/visualState'

function ArrayRow({
  name,
  values,
  highlightIndex,
  changed,
}: {
  name: string
  values: ParsedValue[]
  highlightIndex?: number | null
  changed?: boolean
}) {
  return (
    <div className={`visual-var ${changed ? 'changed' : ''}`}>
      <div className="visual-var-label">{name.toUpperCase()}</div>
      <div className="array-row">
        {values.map((value, index) => (
          <div key={`${name}-${index}`} className="array-cell-wrap">
            <div className={`array-cell ${highlightIndex === index ? 'active' : ''}`}>
              {formatCellValue(value)}
            </div>
            <span className="array-index">{index}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NestedListVar({
  name,
  values,
  changed,
}: {
  name: string
  values: ParsedValue[]
  changed?: boolean
}) {
  return (
    <div className={`visual-var ${changed ? 'changed' : ''}`}>
      <div className="visual-var-label">{name.toUpperCase()}</div>
      <div className="nested-list">
        {values.map((item, index) => (
          <div key={`${name}-${index}`} className="nested-list-row">
            <span className="nested-list-index">{index}</span>
            <div className="array-row compact">
              {isArrayValue(item) ? (
                item.map((cell, cellIndex) => (
                  <div key={`${name}-${index}-${cellIndex}`} className="array-cell-wrap">
                    <div className="array-cell">{formatCellValue(cell)}</div>
                  </div>
                ))
              ) : (
                <div className="array-cell-wrap">
                  <div className="array-cell">{formatCellValue(item)}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScalarVar({
  name,
  value,
  changed,
}: {
  name: string
  value: string
  changed?: boolean
}) {
  return (
    <div className={`visual-var scalar ${changed ? 'changed' : ''}`}>
      <div className="visual-var-label">{name.toUpperCase()}</div>
      <div className="scalar-value">{value}</div>
    </div>
  )
}

interface VisualStatePanelProps {
  variables: Record<string, string>
  changedKeys: string[]
  inputText: string
}

const HIDDEN_KEYS = new Set(['Solution', 'dfs'])

export function VisualStatePanel({ variables, changedKeys, inputText }: VisualStatePanelProps) {
  const changed = new Set(changedKeys)
  const indexVar = variables.i ?? variables.index ?? variables.mid ?? variables.left ?? variables.right
  const parsedIndex = indexVar ? Number.parseInt(indexVar, 10) : Number.NaN
  const highlightIndex = Number.isNaN(parsedIndex) ? null : parsedIndex

  const entries = Object.entries(variables).filter(([name]) => !HIDDEN_KEYS.has(name))

  return (
    <div className="visual-state">
      {inputText.trim() && (
        <div className="visual-section">
          <div className="visual-section-title">INPUT</div>
          <div className="input-chip">{inputText.trim()}</div>
        </div>
      )}

      <div className="visual-section">
        <div className="visual-section-title">STATE</div>
        {entries.length === 0 ? (
          <p className="muted">No variables yet. Step through execution to see state.</p>
        ) : (
          <div className="visual-vars">
            {entries.map(([name, raw]) => {
              const parsed = parsePythonValue(raw)
              const isChanged = changed.has(name)

              if (isArrayValue(parsed)) {
                const hasNestedArrays = parsed.some((item) => isArrayValue(item))
                if (hasNestedArrays) {
                  return <NestedListVar key={name} name={name} values={parsed} changed={isChanged} />
                }
                const shouldHighlight = (name === 'nums' || name === 'arr') ? highlightIndex : null
                return (
                  <ArrayRow
                    key={name}
                    name={name}
                    values={parsed}
                    highlightIndex={shouldHighlight}
                    changed={isChanged}
                  />
                )
              }

              return <ScalarVar key={name} name={name} value={raw} changed={isChanged} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
