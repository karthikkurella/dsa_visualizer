interface StepControlsProps {
  currentStep: number
  totalSteps: number
  onFirst: () => void
  onPrev: () => void
  onNext: () => void
  onLast: () => void
  disabled: boolean
}

export function StepControls({
  currentStep,
  totalSteps,
  onFirst,
  onPrev,
  onNext,
  onLast,
  disabled,
}: StepControlsProps) {
  const atStart = currentStep <= 0 || totalSteps === 0
  const atEnd = currentStep >= totalSteps - 1 || totalSteps === 0

  return (
    <div className="step-controls">
      <button type="button" onClick={onFirst} disabled={disabled || atStart} title="First step">
        ⏮
      </button>
      <button type="button" onClick={onPrev} disabled={disabled || atStart} title="Previous step">
        ◀
      </button>
      <span className="step-indicator">
        {totalSteps === 0 ? 'No steps' : `Step ${currentStep + 1} of ${totalSteps}`}
      </span>
      <button type="button" onClick={onNext} disabled={disabled || atEnd} title="Next step">
        ▶
      </button>
      <button type="button" onClick={onLast} disabled={disabled || atEnd} title="Last step">
        ⏭
      </button>
    </div>
  )
}
