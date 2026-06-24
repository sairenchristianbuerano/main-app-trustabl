import { useId } from 'react'

interface RadioProps {
  value: string
  name: string
  checked: boolean
  onChange: (value: string) => void
  label?: string
  disabled?: boolean
}

export function Radio({ value, name, checked, onChange, label, disabled }: RadioProps) {
  const id = useId()

  return (
    <label
      htmlFor={id}
      className={[
        'flex items-center gap-2.5 cursor-pointer',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="relative flex items-center justify-center">
        <input
          id={id}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={() => onChange(value)}
          className="sr-only"
        />
        <div className={[
          'w-4 h-4 rounded-full border transition-[background,border-color] duration-150',
          checked
            ? 'bg-[var(--color-text-primary)] border-[var(--color-text-primary)]'
            : 'bg-transparent border-[var(--color-border-focus)]',
        ].join(' ')}>
          {checked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-bg-page)]" />
            </div>
          )}
        </div>
      </div>
      {label && <span className="text-sm text-[var(--color-text-primary)]">{label}</span>}
    </label>
  )
}
