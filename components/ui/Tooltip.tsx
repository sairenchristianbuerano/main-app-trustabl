'use client'
import { useState, useRef, useCallback } from 'react'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  content:   string
  position?: TooltipPosition
  children:  React.ReactNode
}

const tooltipStyles: Record<TooltipPosition, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
}

const SHOW_DELAY = 400

export function Tooltip({ content, position = 'top', children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEnter = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(true), SHOW_DELAY)
  }, [])

  const handleLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setVisible(false)
  }, [])

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={[
            'absolute px-2.5 py-1.5 rounded-[var(--radius-sharp)] bg-[var(--color-bg-overlay)] border border-[var(--color-border-muted)] shadow-[var(--shadow-float)] text-xs font-medium text-[var(--color-text-primary)] whitespace-nowrap pointer-events-none',
            'animate-[fadeIn_var(--duration-base)_ease-out]',
            tooltipStyles[position],
          ].join(' ')}
          style={{ zIndex: 'var(--z-toast)' }}
        >
          {content}
        </div>
      )}
    </div>
  )
}
