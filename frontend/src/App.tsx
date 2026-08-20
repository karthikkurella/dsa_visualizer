import { useCallback, useEffect, useMemo, useState } from 'react'
import { traceCode } from './api'
import { EXAMPLES } from './examples'
import { CodeViewer } from './components/CodeViewer'
import { CallStackChain } from './components/CallStackChain'
import { ExecutionFlowView } from './components/ExecutionFlowView'
import { PlaybackBar } from './components/PlaybackBar'
import type { TraceResponse } from './types'
import { explainStep } from './utils/stepExplanation'
import { getChangedKeys, getCurrentVariables } from './utils/visualState'
import './App.css'

const DEFAULT_CODE = EXAMPLES[0].code

function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [input, setInput] = useState(EXAMPLES[0].input)
  const [trace, setTrace] = useState<TraceResponse | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const codeLineCount = useMemo(() => code.split('\n').length + 1, [code])
  const inputLineCount = useMemo(() => Math.max(2, input.split('\n').length + 1), [input])

  const runTrace = useCallback(async () => {
    setLoading(true)
    setPlaying(false)
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

  const totalSteps = trace?.steps.length ?? 0

  useEffect(() => {
    if (!playing || !trace || totalSteps === 0) return

    const timer = window.setInterval(() => {
      setStepIndex((index) => {
        if (index >= totalSteps - 1) {
          setPlaying(false)
          return index
        }
        return index + 1
      })
    }, 1000 / speed)

    return () => window.clearInterval(timer)
  }, [playing, speed, totalSteps, trace])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!trace || trace.steps.length === 0) return
      if (e.key === 'ArrowRight' || e.key === 'l') {
        setStepIndex((i) => Math.min(i + 1, trace.steps.length - 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        setStepIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === ' ') {
        e.preventDefault()
        setPlaying((value) => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [trace])

  const currentStep = trace?.steps[stepIndex]
  const previousStep = stepIndex > 0 ? trace?.steps[stepIndex - 1] : undefined
  const sourceLines = trace?.sourceLines ?? []
  const activeLine = currentStep?.line ?? null

  const currentVars = useMemo(
    () => getCurrentVariables(currentStep?.stack ?? []),
    [currentStep],
  )
  const previousVars = useMemo(
    () => getCurrentVariables(previousStep?.stack ?? []),
    [previousStep],
  )
  const changedKeys = useMemo(
    () => new Set(getChangedKeys(previousVars, currentVars)),
    [previousVars, currentVars],
  )
  const explanation = useMemo(
    () =>
      explainStep(
        sourceLines,
        currentStep?.line ?? null,
        previousVars,
        currentVars,
        currentStep?.function,
      ),
    [sourceLines, currentStep, previousVars, currentVars],
  )

  const exampleName =
    EXAMPLES.find((example) => example.code === code && example.input === input)?.name
    ?? 'Your Solution'

  const loadExample = (index: number) => {
    const example = EXAMPLES[index]
    setCode(example.code)
    setInput(example.input)
    setTrace(null)
    setStepIndex(0)
    setPlaying(false)
    setError(null)
  }

  const stdout = currentStep?.stdout || trace?.finalStdout || ''

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>DSA Code Visualizer</h1>
          <p className="subtitle">
            Python Tutor-style execution: step through code, frames, calls, and print output.
          </p>
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
          <button type="button" className="btn stop" onClick={() => setPlaying(false)} disabled={!playing}>
            Stop
          </button>
          <button type="button" className="btn primary" onClick={runTrace} disabled={loading}>
            {loading ? 'Loading Python...' : 'Run'}
          </button>
        </div>
      </header>

      {error && (
        <div className="alert error">
          <strong>Error:</strong> {error}
          {trace?.errorLine && <span> (line {trace.errorLine})</span>}
        </div>
      )}

      <div className="workspace pt-workspace">
        <section className="editor-section">
          <div className="panel editor-panel">
            <div className="panel-header">
              <h3>main.py</h3>
            </div>
            {trace ? (
              <CodeViewer
                lines={sourceLines}
                activeLine={activeLine}
                errorLine={trace?.errorLine ?? null}
              />
            ) : (
              <textarea
                className="code-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                rows={Math.max(14, codeLineCount)}
                placeholder="Paste your Solution class or Python code here..."
              />
            )}
            {trace && (
              <button type="button" className="edit-code-btn" onClick={() => setTrace(null)}>
                Edit code
              </button>
            )}
          </div>

          <div className="panel editor-panel input-panel">
            <div className="panel-header">
              <h3>Input</h3>
            </div>
            <textarea
              className="input-editor"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              rows={inputLineCount}
              placeholder="Variable assignments, e.g. nums = [1,2,3]"
            />
          </div>

          <CallStackChain
            stack={currentStep?.stack ?? []}
            callDepth={currentStep?.call_depth ?? 0}
            currentFunction={currentStep?.function}
            hasTrace={!!trace}
          />
        </section>

        <section className="viz-section">
          <div className="panel flow-panel">
            <PlaybackBar
              title={exampleName}
              currentStep={stepIndex}
              totalSteps={totalSteps}
              playing={playing}
              speed={speed}
              disabled={!trace || totalSteps === 0}
              onFirst={() => setStepIndex(0)}
              onPrev={() => setStepIndex((i) => Math.max(0, i - 1))}
              onTogglePlay={() => setPlaying((value) => !value)}
              onNext={() => setStepIndex((i) => Math.min((trace?.steps.length ?? 1) - 1, i + 1))}
              onLast={() => setStepIndex(Math.max(0, (trace?.steps.length ?? 1) - 1))}
              onStepSelect={setStepIndex}
              onSpeedChange={setSpeed}
            />

            <ExecutionFlowView
              stack={currentStep?.stack ?? []}
              changedKeys={changedKeys}
              stdout={stdout}
              hasTrace={!!trace}
            />

            <div className="explanation-panel">
              <div className="explanation-title">Explanation of this step</div>
              <p className="explanation-line">
                {activeLine !== null && sourceLines[activeLine - 1] ? (
                  <code>{sourceLines[activeLine - 1].trim()}</code>
                ) : (
                  <span className="muted">No active line</span>
                )}
              </p>
              <p className="explanation-text">
                {trace ? explanation : 'Press Run to start the visual walkthrough.'}
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer className="footer">
        <span>Keyboard: ← → step · space play/pause</span>
        <span>Runs in your browser · Python via Pyodide</span>
      </footer>
    </div>
  )
}

export default App
