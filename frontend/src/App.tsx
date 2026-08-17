import { useCallback, useEffect, useState } from 'react'
import { traceCode } from './api'
import { EXAMPLES } from './examples'
import { CodeViewer } from './components/CodeViewer'
import { VariablesPanel } from './components/VariablesPanel'
import { StepControls } from './components/StepControls'
import type { TraceResponse } from './types'
import './App.css'

const DEFAULT_CODE = EXAMPLES[0].code

function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [input, setInput] = useState('')
  const [trace, setTrace] = useState<TraceResponse | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runTrace = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await traceCode(code, input)
      setTrace(result)
      setStepIndex(0)
      if (!result.success && result.error) {
        setError(result.error)
      }
    } catch (err) {
      setTrace(null)
      setError(err instanceof Error ? err.message : 'Failed to trace code')
    } finally {
      setLoading(false)
    }
  }, [code, input])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!trace || trace.steps.length === 0) return
      if (e.key === 'ArrowRight' || e.key === 'l') {
        setStepIndex((i) => Math.min(i + 1, trace.steps.length - 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        setStepIndex((i) => Math.max(i - 1, 0))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [trace])

  const currentStep = trace?.steps[stepIndex]
  const sourceLines = trace?.sourceLines ?? []
  const activeLine = currentStep?.line ?? null

  const loadExample = (index: number) => {
    const example = EXAMPLES[index]
    setCode(example.code)
    setInput(example.input)
    setTrace(null)
    setStepIndex(0)
    setError(null)
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>DSA Code Visualizer</h1>
          <p className="subtitle">Paste LeetCode-style Solution classes or plain Python. Set inputs like <code>nums = [1,2,3]</code>.</p>
        </div>
        <div className="header-actions">
          <select
            className="example-select"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value !== '') loadExample(Number(e.target.value))
              e.target.value = ''
            }}
          >
            <option value="" disabled>
              Load example...
            </option>
            {EXAMPLES.map((ex, i) => (
              <option key={ex.name} value={i}>
                {ex.name}
              </option>
            ))}
          </select>
          <button type="button" className="btn primary" onClick={runTrace} disabled={loading}>
            {loading ? 'Loading Python & running...' : '▶ Run & Visualize'}
          </button>
        </div>
      </header>

      {error && (
        <div className="alert error">
          <strong>Error:</strong> {error}
          {trace?.errorLine && <span> (line {trace.errorLine})</span>}
        </div>
      )}

      <div className="workspace">
        <section className="editor-section">
          <div className="panel">
            <div className="panel-header">
              <h3>Code</h3>
            </div>
            <textarea
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              placeholder="Paste your Solution class or Python code here..."
            />
          </div>
          <div className="panel">
            <div className="panel-header">
              <h3>Input</h3>
            </div>
            <textarea
              className="input-editor"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder="Variable assignments, e.g. nums = [1,2,3]"
            />
          </div>
        </section>

        <section className="viz-section">
          <div className="panel code-panel">
            <div className="panel-header">
              <h3>Execution</h3>
              {currentStep?.event === 'end' && <span className="badge done">finished</span>}
            </div>
            <CodeViewer
              lines={sourceLines}
              activeLine={activeLine}
              errorLine={trace?.errorLine ?? null}
            />
          </div>

          <aside className="side-panel">
            <StepControls
              currentStep={stepIndex}
              totalSteps={trace?.steps.length ?? 0}
              onFirst={() => setStepIndex(0)}
              onPrev={() => setStepIndex((i) => Math.max(0, i - 1))}
              onNext={() => setStepIndex((i) => Math.min((trace?.steps.length ?? 1) - 1, i + 1))}
              onLast={() => setStepIndex(Math.max(0, (trace?.steps.length ?? 1) - 1))}
              disabled={!trace || trace.steps.length === 0}
            />

            <VariablesPanel
              variables={currentStep?.variables ?? {}}
              callDepth={currentStep?.call_depth ?? 0}
              functionName={currentStep?.function}
            />

            <div className="panel output-panel">
              <div className="panel-header">
                <h3>Output</h3>
              </div>
              <div className="panel-body">
                <pre className="stdout">{currentStep?.stdout || trace?.finalStdout || '(no output yet)'}</pre>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <footer className="footer">
        <span>Keyboard: ← → or h / l to step</span>
        <span>Runs in your browser · Python via Pyodide · 2000 step limit · 5s timeout</span>
      </footer>
    </div>
  )
}

export default App
