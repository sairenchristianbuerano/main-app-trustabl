'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open:      boolean
  onClose:   () => void
  title:     string
  children:  React.ReactNode
  footer?:   React.ReactNode
  variant?:  'default' | 'warning' | 'danger'
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center animate-[fadeIn_150ms_ease-out]"
      style={{
        backgroundColor: 'var(--color-backdrop)',
        zIndex: 'var(--z-modal)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-[440px] mx-4 rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-modal)] overflow-visible animate-[fadeIn_150ms_ease-out]"
      >
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-[var(--color-border-muted)]">
          <h2 id="modal-title" className="text-[15px] font-semibold text-[var(--color-text-primary)]">{title}</h2>
          <button onClick={onClose} aria-label="Close modal" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-5 text-sm text-[var(--color-text-secondary)]">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[var(--color-border-muted)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
