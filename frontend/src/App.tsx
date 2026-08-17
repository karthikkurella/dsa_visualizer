import { useCallback, useEffect, useMemo, useState } from 'react'
import { traceCode } from './api'
import { EXAMPLES } from './examples'
import { CodeViewer } from './components/CodeViewer'
import { PlaybackBar } from './components/PlaybackBar'
import { CallStackChain } from './components/CallStackChain'
import { VisualStatePanel } from './components/VisualStatePanel'
import type { TraceResponse } from './types'
import { explainStep } from './utils/stepExplanation'
import { getChangedKeys, getCurrentVariables } from './utils/visualState'
import './App.css'

const DEFAULT_CODE = EXAMPLES[0].code

function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [input, setInput] = useState('')
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
    () => getChangedKeys(previousVars, currentVars),
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

  const exampleName = EXAMPLES.find((example) => example.code === code && example.input === input)?.name ?? 'Your Solution'

  const loadExample = (index: number) => {
    const example = EXAMPLES[index]
    setCode(example.code)
    setInput(example.input)
    setTrace(null)
    setStepIndex(0)
    setPlaying(false)
    setError(null)
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>DSA Code Visualizer</h1>
          <p className="subtitle">NeetCode-style step-by-step visual execution for your Python solutions.</p>
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
          <div className="panel editor-panel">
            <div className="panel-header">
              <h3>Code</h3>
            </div>
            <textarea
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={Math.max(14, codeLineCount)}
              placeholder="Paste your Solution class or Python code here..."
            />
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

        <section className="main-section">
          <div className="panel visual-panel">
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

            <div className="panel-body visual-body">
              <VisualStatePanel
                variables={currentVars}
                changedKeys={changedKeys}
                inputText={input}
              />

              <div className="explanation-box">
                <div className="explanation-label">What&apos;s happening</div>
                <p>{trace ? explanation : 'Run your code to start the visual walkthrough.'}</p>
              </div>

              {(currentStep?.stdout || trace?.finalStdout) && (
                <div className="output-box">
                  <div className="explanation-label">Output</div>
                  <pre>{currentStep?.stdout || trace?.finalStdout}</pre>
                </div>
              )}
            </div>
          </div>

          {trace && (
            <div className="panel code-panel execution-panel">
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
          )}
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
