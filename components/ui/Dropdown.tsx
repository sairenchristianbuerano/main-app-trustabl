'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react'

interface Option { label: string; value: string }

interface DropdownProps {
  options: Option[]
  value?: string | string[]
  onChange: (value: string | string[]) => void
  type?: 'single' | 'multi'
  placeholder?: string
  label?: string
  disabled?: boolean
}

export function Dropdown({
  options, value, onChange, type = 'single',
  placeholder = 'Select...', label, disabled,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
  }, [open])

  const selected = type === 'multi'
    ? (value as string[] ?? [])
    : (value as string ?? null)

  const handleSelect = (val: string) => {
    if (type === 'multi') {
      const arr = selected as string[]
      onChange(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
    } else {
      onChange(val)
      setOpen(false)
    }
  }

  const selectedLabels = type === 'multi'
    ? options.filter(o => (selected as string[]).includes(o.value))
    : options.find(o => o.value === selected)

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-medium text-[var(--color-text-primary)]">{label}</span>}
      <div ref={ref} className="relative">
        <button
          ref={btnRef}
          type="button"
          disabled={disabled}
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={[
            'flex items-center gap-2 w-full h-[42px] px-3 rounded-[var(--radius-sharp)] border text-sm',
            'bg-[var(--color-bg-surface)] transition-[border-color] duration-150',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            open
              ? 'border-[var(--color-text-primary)]'
              : 'border-[var(--color-border-muted)]',
          ].join(' ')}
        >
          {type === 'multi' && (selected as string[]).length > 0 ? (
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {(selectedLabels as Option[]).map(o => (
                <span key={o.value} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-bg-raised)] border border-[var(--color-border-focus)] text-xs text-[var(--color-text-primary)]">
                  {o.label}
                  <X size={10} onClick={(e) => { e.stopPropagation(); handleSelect(o.value) }} className="cursor-pointer" />
                </span>
              ))}
            </div>
          ) : (
            <span className={['flex-1 text-left truncate', !selected || (Array.isArray(selected) && selected.length === 0) ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'].join(' ')}>
              {Array.isArray(selectedLabels) || !selectedLabels ? placeholder : (selectedLabels as Option).label}
            </span>
          )}
          {open ? <ChevronUp size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" /> : <ChevronDown size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />}
        </button>

        {open && (
          <ul
            role="listbox"
            className="fixed rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-overlay)] shadow-[var(--shadow-float)] overflow-y-auto max-h-[300px] animate-[fadeScale_150ms_ease-out]"
            style={{ zIndex: 'var(--z-dropdown)', top: pos.top, left: pos.left, width: pos.width, transformOrigin: 'top' }}
          >
            {options.map(option => {
              const isSelected = type === 'multi'
                ? (selected as string[]).includes(option.value)
                : selected === option.value
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className="flex items-center justify-between px-3 py-3 text-sm text-[var(--color-text-primary)] cursor-pointer hover:bg-[var(--color-bg-raised)] transition-[background] duration-150"
                >
                  {type === 'multi' && (
                    <div className={['w-4 h-4 rounded-[4px] border flex items-center justify-center mr-2.5 flex-shrink-0', isSelected ? 'bg-[var(--color-text-primary)] border-[var(--color-text-primary)]' : 'border-[var(--color-border-focus)]'].join(' ')}>
                      {isSelected && <Check size={9} strokeWidth={2.5} className="text-[var(--color-bg-page)]" />}
                    </div>
                  )}
                  <span className="flex-1">{option.label}</span>
                  {type === 'single' && isSelected && <Check size={16} className="text-[var(--color-text-primary)]" />}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
