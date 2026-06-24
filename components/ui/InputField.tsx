import { AlertCircle } from 'lucide-react'
import { useId } from 'react'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  required?: boolean
  optional?: boolean
  iconLeft?: React.ElementType
  iconRight?: React.ElementType
}

export function InputField({
  label,
  error,
  hint,
  required,
  optional,
  iconLeft: IconLeft,
  iconRight: IconRight,
  disabled,
  className,
  ...props
}: InputFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-[var(--color-text-primary)]">
          {label}
          {required && <span className="text-[var(--color-danger-text)] ml-0.5">*</span>}
          {optional && <span className="text-[var(--color-text-tertiary)] font-normal ml-1 text-[11px]">(optional)</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {IconLeft && (
          <IconLeft
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
          />
        )}
        <input
          id={id}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={[error ? errorId : '', hint ? hintId : ''].filter(Boolean).join(' ') || undefined}
          className={[
            'h-[42px] w-full rounded-[var(--radius-sharp)] border bg-[var(--color-bg-surface)]',
            'px-3 text-sm text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-tertiary)]',
            'outline-none transition-[border-color] duration-150 ease',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error
              ? 'border-[var(--color-danger-text)]'
              : 'border-[var(--color-border-muted)]',
            IconLeft ? 'pl-9' : '',
            IconRight ? 'pr-9' : '',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        />
        {IconRight && (
          <IconRight
            size={16}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
          />
        )}
      </div>

      {error && (
        <p id={errorId} className="flex items-center gap-1 text-[11px] text-[var(--color-danger-text)]">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={hintId} className="text-[11px] text-[var(--color-text-tertiary)]">
          {hint}
        </p>
      )}
    </div>
  )
}
