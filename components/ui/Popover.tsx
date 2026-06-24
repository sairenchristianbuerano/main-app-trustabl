'use client'
import { useState, useRef, useEffect } from 'react'
import { Divider } from './Divider'

interface MenuItem {
  label: string
  icon?: React.ElementType
  onClick: () => void
  danger?: boolean
}

interface PopoverProps {
  trigger: React.ReactNode
  type?: 'content' | 'menu'
  title?: string
  description?: string
  footer?: React.ReactNode
  header?: React.ReactNode
  items?: MenuItem[]
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Popover({ trigger, type = 'content', title, description, footer, header, items = [], position = 'bottom' }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const normalItems = items.filter(i => !i.danger)
  const dangerItems = items.filter(i => i.danger)

  return (
    <div ref={ref} className="relative inline-flex">
      <div onClick={() => setOpen(v => !v)}>{trigger}</div>

      {open && (
        <div className={[
          'absolute min-w-[180px] rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-overlay)] shadow-[var(--shadow-float)] overflow-hidden animate-[fadeScale_150ms_ease-out]',
          position === 'bottom' ? 'top-full mt-2 left-0' : '',
          position === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : '',
          position === 'left' ? 'right-full mr-2 top-0' : '',
          position === 'right' ? 'left-full ml-2 top-0' : '',
        ].filter(Boolean).join(' ')}
        style={{ zIndex: 'var(--z-dropdown)' }}>
          {type === 'content' && (
            <div className="p-4">
              {title && <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">{title}</p>}
              {description && <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">{description}</p>}
              {footer}
            </div>
          )}
          {type === 'menu' && (
            <div>
              {header && (
                <>
                  <div className="px-3.5 py-2.5">{header}</div>
                  <Divider />
                </>
              )}
              {normalItems.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    onClick={() => { item.onClick(); setOpen(false) }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-raised)] transition-[background] duration-150"
                  >
                    {Icon && <Icon size={16} />}
                    {item.label}
                  </button>
                )
              })}
              {dangerItems.length > 0 && (
                <>
                  <Divider />
                  {dangerItems.map(item => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.label}
                        onClick={() => { item.onClick(); setOpen(false) }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-[var(--color-danger-text)] hover:bg-[var(--color-bg-raised)] transition-[background] duration-150"
                      >
                        {Icon && <Icon size={16} />}
                        {item.label}
                      </button>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
