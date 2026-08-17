interface VariablesPanelProps {
  variables: Record<string, string>
  callDepth: number
  functionName: string | null | undefined
}

export function VariablesPanel({ variables, callDepth, functionName }: VariablesPanelProps) {
  const entries = Object.entries(variables)

  return (
    <div className="panel variables-panel">
      <div className="panel-header">
        <h3>Variables</h3>
        {functionName && <span className="badge">{functionName}()</span>}
        {callDepth > 0 && <span className="badge depth">depth {callDepth}</span>}
      </div>
      <div className="panel-body">
        {entries.length === 0 ? (
          <p className="muted">No local variables at this step.</p>
        ) : (
          <table className="vars-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([name, value]) => (
                <tr key={name}>
                  <td className="var-name">{name}</td>
                  <td className="var-value">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
