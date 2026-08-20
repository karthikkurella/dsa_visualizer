interface PlaybackBarProps {
  title: string
  currentStep: number
  totalSteps: number
  playing: boolean
  speed: number
  disabled: boolean
  onFirst: () => void
  onPrev: () => void
  onTogglePlay: () => void
  onNext: () => void
  onLast: () => void
  onStepSelect: (index: number) => void
  onSpeedChange: (speed: number) => void
}

const SPEEDS = [0.5, 1, 2]

export function PlaybackBar({
  title,
  currentStep,
  totalSteps,
  playing,
  speed,
  disabled,
  onFirst,
  onPrev,
  onTogglePlay,
  onNext,
  onLast,
  onStepSelect,
  onSpeedChange,
}: PlaybackBarProps) {
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0
  const showDots = totalSteps > 0 && totalSteps <= 40

  return (
    <div className="playback-bar">
      <div className="playback-top">
        <div>
          <div className="viz-title">{title}</div>
          <div className="step-count">
            {totalSteps === 0 ? 'No steps yet' : `Step ${currentStep + 1} / ${totalSteps}`}
          </div>
        </div>

        <div className="playback-controls">
          <button type="button" onClick={onFirst} disabled={disabled || currentStep === 0} aria-label="First">
            ⏮
          </button>
          <button type="button" onClick={onPrev} disabled={disabled || currentStep === 0} aria-label="Previous">
            ◀
          </button>
          <button type="button" className="play-btn" onClick={onTogglePlay} disabled={disabled || totalSteps === 0} aria-label="Play">
            {playing ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={disabled || currentStep >= totalSteps - 1}
            aria-label="Next"
          >
            ▶
          </button>
          <button
            type="button"
            onClick={onLast}
            disabled={disabled || currentStep >= totalSteps - 1}
            aria-label="Last"
          >
            ⏭
          </button>
        </div>

        <div className="speed-group">
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              className={speed === value ? 'active' : ''}
              onClick={() => onSpeedChange(value)}
              disabled={disabled}
            >
              {value}x
            </button>
          ))}
        </div>
      </div>

      <div className="timeline">
        <div className="timeline-track">
          <div className="timeline-fill" style={{ width: `${progress}%` }} />
          {showDots &&
            Array.from({ length: totalSteps }, (_, index) => (
              <button
                key={index}
                type="button"
                className={`timeline-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'done' : ''}`}
                style={{ left: totalSteps > 1 ? `${(index / (totalSteps - 1)) * 100}%` : '0%' }}
                onClick={() => onStepSelect(index)}
                disabled={disabled}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
