interface ProgressBarProps {
  value: number
  label?: string
  showValue?: boolean
  className?: string
}

export function ProgressBar({ value, label, showValue, className }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={['flex flex-col gap-[var(--space-inner)]', className].filter(Boolean).join(' ')}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>}
          {showValue && <span className="text-xs text-[var(--color-text-primary)]">{clampedValue}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-[6px] w-full rounded-[var(--radius-pill)] bg-[var(--color-border-muted)] overflow-hidden"
      >
        <div
          className="h-full rounded-[var(--radius-pill)] bg-[var(--color-text-primary)] transition-[width] duration-300"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
