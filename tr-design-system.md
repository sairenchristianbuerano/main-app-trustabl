# CF Design System

> A three-layer design system for Component Factory — built for humans and AI agents alike.

## 1. Overview

### Three-Layer Architecture

| Layer | Purpose | Used by |
|---|---|---|
| **Primitive** | Raw values — colors, sizes, radii | Semantic tokens only — never components |
| **Semantic** | Intent-based tokens | Components and patterns |
| **Component** | UI building blocks | Patterns and pages |

```
Primitive → Semantic → Component → Pattern → Page
```

---

## 1.5 Setup & Token Wiring

### globals.css

```css
/* app/globals.css */
@import "tailwindcss";

:root {
  /* Primitive tokens */
  --primitive-neutral-0:   #FFFFFF;
  --primitive-neutral-50:  #F0F1F5;
  --primitive-neutral-100: #9899A8;
  --primitive-neutral-200: #5C5E72;
  --primitive-neutral-300: #3A3D52;
  --primitive-neutral-400: #222536;
  --primitive-neutral-500: #1A1D27;
  --primitive-neutral-600: #161923;
  --primitive-neutral-700: #13151D;
  --primitive-neutral-800: #0F1117;

  --primitive-teal-400: #2DD48F;
  --primitive-teal-500: #1ABCAA;
  --primitive-sky-600:  #0EA5E9;
  --primitive-teal-900: #0C2B2E;
  --primitive-sky-800:  #1A4D6E;

  --primitive-green-400: #4ADE80;
  --primitive-green-900: #0C1F12;
  --primitive-amber-400: #FBBF24;
  --primitive-amber-900: #1C160A;
  --primitive-red-400:   #F87171;
  --primitive-red-500:   #2A1010;
  --primitive-red-800:   #7F2020;
  --primitive-red-900:   #1C0F0F;

  --primitive-space-4:  4px;
  --primitive-space-8:  8px;
  --primitive-space-12: 12px;
  --primitive-space-16: 16px;
  --primitive-space-24: 24px;
  --primitive-space-32: 32px;
  --primitive-space-48: 48px;
  --primitive-space-64: 64px;

  --primitive-radius-8:    8px;
  --primitive-radius-10:   10px;
  --primitive-radius-12:   12px;
  --primitive-radius-15:   15px;
  --primitive-radius-9999: 9999px;

  /* Semantic tokens — Dark Mode (default) */
  --color-bg-page:      var(--primitive-neutral-800);
  --color-bg-surface:   var(--primitive-neutral-700);
  --color-bg-overlay:   var(--primitive-neutral-600);
  --color-bg-raised:    var(--primitive-neutral-500);

  --color-border-muted: var(--primitive-neutral-400);
  --color-border-focus: #363A52;

  --color-text-primary:   var(--primitive-neutral-50);
  --color-text-secondary: var(--primitive-neutral-100);
  --color-text-tertiary:  var(--primitive-neutral-200);
  --color-text-disabled:  var(--primitive-neutral-300);

  --color-accent-default: var(--primitive-teal-400);
  --color-accent-hover:   var(--primitive-teal-500);
  --color-accent-active:  var(--primitive-sky-600);
  --color-accent-subtle:  var(--primitive-teal-900);
  --color-accent-border:  var(--primitive-sky-800);

  --color-danger-text:   var(--primitive-red-400);
  --color-danger-bg:     var(--primitive-red-900);
  --color-danger-hover:  var(--primitive-red-500);
  --color-danger-border: var(--primitive-red-800);
  --color-success-text:  var(--primitive-green-400);
  --color-success-bg:    var(--primitive-green-900);
  --color-warning-text:  var(--primitive-amber-400);
  --color-warning-bg:    var(--primitive-amber-900);
  --color-info-text:     var(--primitive-teal-400);
  --color-info-bg:       var(--primitive-teal-900);
  --color-neutral-text:  var(--primitive-neutral-100);
  --color-neutral-bg:    var(--primitive-neutral-700);

  --space-tight:   var(--primitive-space-4);
  --space-inner:   var(--primitive-space-8);
  --space-base:    var(--primitive-space-16);
  --space-section: var(--primitive-space-24);
  --space-layout:  var(--primitive-space-48);
  --space-page:    var(--primitive-space-64);

  --radius-sharp: var(--primitive-radius-8);
  --radius-base:  var(--primitive-radius-12);
  --radius-card:  var(--primitive-radius-15);
  --radius-pill:  var(--primitive-radius-9999);

  --shadow-card:  0 1px 3px rgba(0,0,0,0.3);
  --shadow-float: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-modal: 0 8px 32px rgba(0,0,0,0.5);

  --z-base:     0;
  --z-overlay:  10;
  --z-dropdown: 20;
  --z-modal:    30;
  --z-toast:    40;
  --z-critical: 50;

  --color-backdrop: rgba(0,0,0,0.6);

  --duration-fast:  100ms;
  --duration-base:  150ms;
  --duration-slow:  250ms;
  --duration-enter: 200ms;
  --duration-exit:  150ms;
  --ease-default: ease;
  --ease-enter:   cubic-bezier(0.2, 0, 0, 1);
  --ease-exit:    cubic-bezier(0.4, 0, 1, 1);
}

[data-theme="light"] {
  --color-bg-page:      #F8F9FB;
  --color-bg-surface:   #FFFFFF;
  --color-bg-overlay:   #F4F5F8;
  --color-bg-raised:    #EDEEF2;
  --color-border-muted: #E2E4EC;
  --color-border-focus: #C8CADE;
  --color-text-primary:   #0F1117;
  --color-text-secondary: #5C5E72;
  --color-text-tertiary:  #9899A8;
  --color-text-disabled:  #C8CADE;
  --color-accent-default: #1A9E72;
  --color-accent-hover:   #158F68;
  --color-accent-subtle:  #E0F4FD;
  --color-accent-border:  #BAE6FD;
  --color-danger-text:   #DC2626;
  --color-danger-bg:     #FEF2F2;
  --color-danger-border: #FECACA;
  --color-success-text: #16A34A;
  --color-success-bg:   #F0FDF4;
  --color-warning-text: #D97706;
  --color-warning-bg:   #FFFBEB;
  --color-info-text: #2DD48F;
  --color-info-bg:   #D0F5EB;
  --color-backdrop:  rgba(0,0,0,0.4);
}

:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

body {
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
  font-family: 'Inter', sans-serif;
}
```

### tailwind.config.ts

```ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
} satisfies Config
```

### next.config.ts

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
}

export default nextConfig
```

### layout.tsx

```tsx
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ToastProvider } from '@/components/ui/ToastContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
```

### Toast Manager

```tsx
// components/ui/ToastContext.tsx
'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { Toast } from './Toast'

interface ToastItem {
  id: number
  message: string
}

interface ToastContextValue {
  toast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

let _id = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string) => {
    const id = ++_id
    setToasts(prev => [...prev, { id, message }])
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 pointer-events-none" style={{ zIndex: 'var(--z-toast)' }}>
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast message={t.message} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
```

### Modal Focus Trap

```bash
npm install focus-trap-react
```

### Error Boundary

```tsx
// components/ui/ErrorBoundary.tsx
'use client'
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center gap-3 p-12 text-center border border-[var(--color-border-muted)] rounded-[15px] bg-[var(--color-bg-surface)]">
          <div className="w-12 h-12 rounded-[var(--radius-base)] bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] flex items-center justify-center">
            <span className="text-[var(--color-danger-text)] text-lg">!</span>
          </div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Something went wrong</p>
          <p className="text-xs text-[var(--color-text-secondary)]">This section failed to load. Try refreshing the page.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-xs text-[var(--color-accent-default)] underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

### Barrel Export

```ts
// components/ui/index.ts
export * from './Alert'
export * from './Avatar'
export * from './Badge'
export * from './Button'
export * from './Card'
export * from './Checkbox'
export * from './Divider'
export * from './Dropdown'
export * from './ErrorBoundary'
export * from './FileUpload'
export * from './InputField'
export * from './Modal'
export * from './NavItem'
export * from './Pagination'
export * from './Popover'
export * from './ProgressBar'
export * from './Radio'
export * from './Skeleton'
export * from './Spinner'
export * from './Table'
export * from './Tabs'
export * from './Toast'
export * from './ToastContext'
export * from './Toggle'
export * from './Tooltip'
```

---

## 4. Components

### 4.1 Core Components

#### Button

**Purpose:** Triggers an action or event.

| Prop | Type | Default |
|---|---|---|
| `variant` | `primary` \| `secondary` \| `ghost` \| `danger` \| `text` | `primary` |
| `size` | `sm` \| `md` \| `lg` | `md` |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` | `false` |
| `icon` | `React.ElementType` | `undefined` |
| `iconOnly` | `boolean` | `false` |

```tsx
// components/ui/Button.tsx
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'text'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ElementType
  iconOnly?: boolean
  children?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   'bg-[var(--color-accent-default)] text-[var(--color-bg-page)] hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-accent-active)]',
  secondary: 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)] hover:bg-[var(--color-bg-overlay)] hover:border-[var(--color-border-focus)]',
  ghost:     'bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border-muted)] hover:bg-[var(--color-bg-surface)] hover:border-[var(--color-border-focus)]',
  danger:    'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)] hover:bg-[var(--color-danger-hover)]',
  text:      'bg-transparent text-[var(--color-text-secondary)] border-none hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-[36px] px-3 text-xs',
  md: 'h-[42px] px-4 text-sm',
  lg: 'h-[46px] px-5 text-sm',
}

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  sm: 'w-[36px] h-[36px] p-0',
  md: 'w-[42px] h-[42px] p-0',
  lg: 'w-[46px] h-[46px] p-0',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconOnly = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-[var(--space-tight)] rounded-[var(--radius-base)] font-medium',
        'transition-[background,border-color,color] duration-150 ease',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantStyles[variant],
        iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon size={16} aria-hidden="true" />
      ) : null}
      {loading && <span className="sr-only">Loading</span>}
      {!iconOnly && children}
    </button>
  )
}
```

---

#### InputField

```tsx
// components/ui/InputField.tsx
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
    <div className="flex flex-col gap-[var(--space-tight)]">
      <label htmlFor={id} className="text-xs font-medium text-[var(--color-text-primary)]">
        {label}
        {required && <span className="text-[var(--color-danger-text)] ml-0.5">*</span>}
        {optional && <span className="text-[var(--color-text-tertiary)] font-normal ml-1 text-[11px]">(optional)</span>}
      </label>

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
```

---

#### Card

```tsx
// components/ui/Card.tsx
interface CardProps {
  variant?: 'default' | 'interactive'
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

interface CardHeaderProps { children: React.ReactNode; className?: string }
interface CardBodyProps { children: React.ReactNode; className?: string }
interface CardFooterProps { children: React.ReactNode; className?: string }

export function Card({ variant = 'default', className, children, onClick }: CardProps) {
  const isInteractive = variant === 'interactive' && !!onClick
  return (
    <div
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() } } : undefined}
      className={[
        'rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] overflow-hidden flex flex-col',
        isInteractive
          ? 'cursor-pointer transition-[border-color,background] duration-150 hover:border-[var(--color-border-focus)] hover:bg-[var(--color-bg-overlay)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]'
          : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={['flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-muted)]', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={['p-4 text-sm text-[var(--color-text-secondary)] flex-1', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={['flex items-center justify-between px-4 py-3 border-t border-[var(--color-border-muted)]', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
```

---

#### ProgressBar

```tsx
// components/ui/ProgressBar.tsx
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
```

---

#### Spinner

```tsx
// components/ui/Spinner.tsx
interface SpinnerProps {
  size?: 'sm' | 'md'
  className?: string
}

const sizeStyles = {
  sm: 'w-[14px] h-[14px] border-2',
  md: 'w-[20px] h-[20px] border-2',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        'rounded-[var(--radius-pill)] border-[var(--color-border-muted)] border-t-[var(--color-text-primary)] animate-spin',
        sizeStyles[size],
        className,
      ].filter(Boolean).join(' ')}
    />
  )
}
```

---

#### Radio

```tsx
// components/ui/Radio.tsx
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
```

---

#### Toggle

```tsx
// components/ui/Toggle.tsx
import { useId } from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  const id = useId()

  return (
    <label
      htmlFor={id}
      className={[
        'flex items-center gap-2.5 cursor-pointer',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={[
          'w-9 h-5 rounded-full transition-[background] duration-150',
          checked
            ? 'bg-[var(--color-text-primary)]'
            : 'bg-[var(--color-border-muted)] border border-[var(--color-border-focus)]',
        ].join(' ')}>
          <div className={[
            'absolute top-[3px] w-3.5 h-3.5 rounded-full transition-[left] duration-150',
            checked
              ? 'left-[18px] bg-[var(--color-bg-page)]'
              : 'left-[3px] bg-[var(--color-text-primary)]',
          ].join(' ')} />
        </div>
      </div>
      {label && <span className="text-sm text-[var(--color-text-primary)]">{label}</span>}
    </label>
  )
}
```

---

#### Checkbox

```tsx
// components/ui/Checkbox.tsx
'use client'
import { Check, Minus } from 'lucide-react'
import { useId, useEffect, useRef } from 'react'

interface CheckboxProps {
  checked: boolean
  indeterminate?: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function Checkbox({ checked, indeterminate, onChange, label, disabled }: CheckboxProps) {
  const id = useId()
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate
  }, [indeterminate])

  return (
    <label
      htmlFor={id}
      className={[
        'flex items-center gap-2.5 cursor-pointer',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={[
          'w-4 h-4 rounded-[4px] border flex items-center justify-center transition-[background,border-color] duration-150',
          checked || indeterminate
            ? 'bg-[var(--color-text-primary)] border-[var(--color-text-primary)]'
            : 'bg-transparent border-[var(--color-border-focus)]',
        ].join(' ')}>
          {indeterminate
            ? <Minus size={9} strokeWidth={2.5} className="text-[var(--color-bg-page)]" />
            : checked
            ? <Check size={9} strokeWidth={2.5} className="text-[var(--color-bg-page)]" />
            : null}
        </div>
      </div>
      {label && <span className="text-sm text-[var(--color-text-primary)]">{label}</span>}
    </label>
  )
}
```

---

#### Dropdown

```tsx
// components/ui/Dropdown.tsx
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
            className="absolute w-full mt-1 rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-overlay)] shadow-[var(--shadow-float)] overflow-y-auto max-h-[300px]"
            style={{ zIndex: 'var(--z-dropdown)' }}
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
```

---

#### Tabs

```tsx
// components/ui/Tabs.tsx

interface Tab {
  label: string
  value: string
  icon?: React.ElementType
  badge?: number
  disabled?: boolean
}

interface TabsProps {
  tabs: Tab[]
  value: string
  onChange: (value: string) => void
  variant?: 'underline' | 'pill'
}

export function Tabs({ tabs, value, onChange, variant = 'underline' }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div role="tablist" className="flex items-center gap-0.5 p-1 rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = tab.value === value
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.value)}
              className={[
                'flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--radius-sharp)] text-sm font-medium',
                'transition-[background,color] duration-150',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                isActive
                  ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
              ].filter(Boolean).join(' ')}
            >
              {Icon && <Icon size={14} />}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={['text-[11px] font-medium px-1.5 py-0.5 rounded-full border', isActive ? 'text-[var(--color-text-primary)] bg-[var(--color-border-muted)] border-[var(--color-border-focus)]' : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] border-[var(--color-border-muted)]'].join(' ')}>
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div role="tablist" className="flex items-center border-b border-[var(--color-border-muted)]">
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = tab.value === value
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
            className={[
              'flex items-center gap-1.5 h-10 px-3.5 text-sm font-medium -mb-px',
              'border-b-2 transition-[color,border-color] duration-150',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              isActive
                ? 'text-[var(--color-text-primary)] border-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] border-transparent hover:text-[var(--color-text-secondary)]',
            ].filter(Boolean).join(' ')}
          >
            {Icon && <Icon size={14} />}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={['text-[11px] font-medium px-1.5 py-0.5 rounded-full border', isActive ? 'text-[var(--color-text-primary)] bg-[var(--color-border-muted)] border-[var(--color-border-focus)]' : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-raised)] border-[var(--color-border-muted)]'].join(' ')}>
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
```

---

#### Badge

```tsx
// components/ui/Badge.tsx
type BadgeVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral'
type BadgeShape = 'pill' | 'sharp'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  shape?: BadgeShape
  size?: BadgeSize
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  info:    'bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
  danger:  'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]',
  neutral: 'bg-[var(--color-neutral-bg)] text-[var(--color-neutral-text)] border border-[var(--color-border-muted)]',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-3 py-1 text-xs',
}

export function Badge({ variant = 'neutral', shape = 'pill', size = 'md', children }: BadgeProps) {
  return (
    <span className={[
      'inline-flex items-center font-medium',
      shape === 'pill' ? 'rounded-[var(--radius-pill)]' : 'rounded-[var(--radius-sharp)]',
      variantStyles[variant],
      sizeStyles[size],
    ].join(' ')}>
      {children}
    </span>
  )
}
```

---

#### Avatar

```tsx
// components/ui/Avatar.tsx
import { User } from 'lucide-react'
import Image from 'next/image'

interface AvatarProps {
  type?: 'icon' | 'initials' | 'photo'
  size?: 'sm' | 'md'
  initials?: string
  src?: string
  alt?: string
}

const sizeStyles = {
  sm: 'w-6 h-6 text-[9px]',
  md: 'w-8 h-8 text-xs',
}

const iconSize = { sm: 14, md: 18 }

export function Avatar({ type = 'icon', size = 'md', initials, src, alt }: AvatarProps) {
  const base = 'rounded-full bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center overflow-hidden flex-shrink-0'

  if (type === 'photo' && src) {
    return (
      <div className={[base, sizeStyles[size], 'relative'].join(' ')}>
        <Image
          src={src}
          alt={alt ?? ''}
          fill
          sizes={size === 'sm' ? '24px' : '32px'}
          className="object-cover rounded-full"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
    )
  }

  if (type === 'initials' && initials) {
    return (
      <div className={[base, sizeStyles[size], 'font-semibold text-[var(--color-text-primary)]'].join(' ')}>
        {initials.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div className={[base, sizeStyles[size]].join(' ')}>
      <User size={iconSize[size]} className="text-[var(--color-text-tertiary)]" />
    </div>
  )
}
```

---

#### NavItem

```tsx
// components/ui/NavItem.tsx

interface NavItemProps {
  label: string
  icon?: React.ElementType
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

export function NavItem({ label, icon: Icon, active, disabled, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      className={[
        'flex items-center gap-2.5 h-9 w-full px-3 rounded-[var(--radius-sharp)] text-sm font-medium',
        'transition-[background,color] duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)]'
          : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]',
      ].filter(Boolean).join(' ')}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  )
}
```

---

#### Divider

```tsx
// components/ui/Divider.tsx
interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Divider({ orientation = 'horizontal', className }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={['w-px h-6 bg-[var(--color-border-muted)] flex-shrink-0', className].filter(Boolean).join(' ')} />
  }
  return <hr className={['border-none h-px bg-[var(--color-border-muted)] w-full', className].filter(Boolean).join(' ')} />
}
```

---

#### Toast

```tsx
// components/ui/Toast.tsx
'use client'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  onDismiss: () => void
  duration?: number
}

export function Toast({ message, onDismiss, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (duration === 0) return
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-float)] max-w-[360px]"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-[var(--color-text-tertiary)] text-sm">•</span>
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{message}</span>
      </div>
      <button onClick={onDismiss} aria-label="Dismiss notification" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]">
        <X size={14} />
      </button>
    </div>
  )
}
```

---

#### Alert

```tsx
// components/ui/Alert.tsx
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react'

type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

interface AlertProps {
  variant?: AlertVariant
  title: string
  description?: string
  onDismiss?: () => void
}

const icons: Record<AlertVariant, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: XCircle,
}

export function Alert({ variant = 'info', title, description, onDismiss }: AlertProps) {
  const Icon = icons[variant]

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-base)] border-l-[3px] border-l-[var(--color-border-muted)] bg-[var(--color-bg-surface)] w-full"
    >
      <Icon size={16} className="text-[var(--color-text-primary)] flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
        {description && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{description}</p>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss alert" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]">
          <X size={16} />
        </button>
      )}
    </div>
  )
}
```

---

#### Tooltip

```tsx
// components/ui/Tooltip.tsx
'use client'
import { useState } from 'react'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  content:   string
  position?: TooltipPosition
  children:  React.ReactNode
}

const wrapperStyles: Record<TooltipPosition, string> = {
  top:    'flex flex-col items-center gap-3',
  bottom: 'flex flex-col-reverse items-center gap-3',
  left:   'flex flex-row items-center gap-3',
  right:  'flex flex-row-reverse items-center gap-3',
}

const arrowStyles: Record<TooltipPosition, React.CSSProperties> = {
  top:    { position:'absolute', bottom:-5, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderTop:'6px solid var(--color-text-primary)' },
  bottom: { position:'absolute', top:-5,   left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderBottom:'6px solid var(--color-text-primary)' },
  left:   { position:'absolute', right:-5, top:'50%',  transform:'translateY(-50%)', width:0, height:0, borderTop:'6px solid transparent', borderBottom:'6px solid transparent', borderLeft:'6px solid var(--color-text-primary)' },
  right:  { position:'absolute', left:-5,  top:'50%',  transform:'translateY(-50%)', width:0, height:0, borderTop:'6px solid transparent', borderBottom:'6px solid transparent', borderRight:'6px solid var(--color-text-primary)' },
}

export function Tooltip({ content, position = 'top', children }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className={['relative inline-flex', wrapperStyles[position]].join(' ')}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {visible && (
        <div
          role="tooltip"
          className="relative px-2.5 py-1.5 rounded-[var(--radius-sharp)] bg-[var(--color-text-primary)] text-[var(--color-bg-page)] text-xs font-medium whitespace-nowrap"
        >
          {content}
          <span style={arrowStyles[position]} aria-hidden="true" />
        </div>
      )}
      {children}
    </div>
  )
}
```

---

#### Skeleton

```tsx
// components/ui/Skeleton.tsx
interface SkeletonProps {
  variant?: 'line' | 'circle' | 'rect'
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({ variant = 'line', width = '100%', height = 14, className }: SkeletonProps) {
  const radiusMap = {
    line: 'rounded-[var(--radius-sharp)]',
    circle: 'rounded-[var(--radius-pill)]',
    rect: 'rounded-[var(--radius-base)]',
  }

  return (
    <div
      aria-hidden="true"
      className={[
        'animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--color-bg-surface)] via-[var(--color-bg-raised)] to-[var(--color-bg-surface)] bg-[length:800px_100%]',
        radiusMap[variant],
        className,
      ].filter(Boolean).join(' ')}
      style={{ width, height }}
    />
  )
}
```

---

#### Popover

```tsx
// components/ui/Popover.tsx
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
  items?: MenuItem[]
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Popover({ trigger, type = 'content', title, description, footer, items = [], position = 'bottom' }: PopoverProps) {
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
          'absolute min-w-[180px] rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-overlay)] shadow-[var(--shadow-float)] overflow-hidden',
          position === 'bottom' ? 'top-full mt-2 left-0' : '',
          position === 'top' ? 'bottom-full mb-2 left-0' : '',
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
```

---

#### Modal

```tsx
// components/ui/Modal.tsx
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

export function Modal({ open, onClose, title, children, footer, variant = 'default' }: ModalProps) {
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
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-backdrop)', zIndex: 'var(--z-modal)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-[440px] mx-4 rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-modal)] overflow-hidden"
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
```

---

#### FileUpload

```tsx
// components/ui/FileUpload.tsx
'use client'
import { useState, useRef } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'

type FileState = 'uploading' | 'complete' | 'error'

interface UploadedFile {
  id: string
  name: string
  size: number
  state: FileState
  errorMessage?: string
}

interface FileUploadProps {
  accept?: string
  maxSize?: number
  multiple?: boolean
  onChange?: (files: File[]) => void
}

export function FileUpload({ accept, maxSize, multiple, onChange }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList) => {
    const fileArr = Array.from(newFiles)
    onChange?.(fileArr)
    const mapped: UploadedFile[] = fileArr.map((f, i) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2,9)}-${i}`,
      name: f.name,
      size: f.size,
      state: maxSize && f.size > maxSize ? 'error' : 'uploading',
      errorMessage: maxSize && f.size > maxSize ? 'File exceeds size limit.' : undefined,
    }))
    setFiles(prev => [...prev, ...mapped])
    mapped.filter(f => f.state === 'uploading').forEach(f => {
      setTimeout(() => setFiles(prev => prev.map(p => p.id === f.id ? { ...p, state: 'complete' } : p)), 1500)
    })
  }

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id))

  return (
    <div className="flex flex-col gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        className={[
          'flex flex-col items-center gap-2 px-6 py-8 rounded-[var(--radius-card)] border-[1.5px] border-dashed cursor-pointer text-center',
          'transition-[border-color,background] duration-150',
          dragOver
            ? 'border-[var(--color-text-primary)] bg-[var(--color-bg-surface)]'
            : 'border-[var(--color-border-muted)] hover:border-[var(--color-border-focus)] hover:bg-[var(--color-bg-surface)]',
        ].join(' ')}
      >
        <Upload size={24} className="text-[var(--color-text-tertiary)]" />
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          {dragOver ? 'Release to upload' : 'Drop files here'}
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {accept ? `${accept} ` : ''}
          {maxSize ? `up to ${Math.round(maxSize / 1024 / 1024)}MB` : ''}
        </p>
      </div>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="sr-only" onChange={(e) => e.target.files && handleFiles(e.target.files)} />

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
              <div className="w-8 h-8 rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] bg-[var(--color-bg-raised)] flex items-center justify-center flex-shrink-0">
                <File size={16} className={file.state === 'error' ? 'text-[var(--color-danger-text)]' : file.state === 'complete' ? 'text-[var(--color-success-text)]' : 'text-[var(--color-text-tertiary)]'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text-primary)] truncate">{file.name}</p>
                <p className={['text-[11px]', file.state === 'error' ? 'text-[var(--color-danger-text)]' : file.state === 'complete' ? 'text-[var(--color-success-text)]' : 'text-[var(--color-text-secondary)]'].join(' ')}>
                  {file.state === 'uploading' ? 'Uploading...' : file.state === 'complete' ? 'Complete' : file.errorMessage}
                </p>
              </div>
              <button onClick={() => removeFile(file.id)} aria-label={`Remove ${file.name}`} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger-text)]">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

#### Table

```tsx
// components/ui/Table.tsx
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Checkbox } from './Checkbox'

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface TableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  selectable?: boolean
  selectedRows?: string[]
  onSelect?: (ids: string[]) => void
  sortKey?: keyof T
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: keyof T) => void
}

export function Table<T extends { id: string }>({
  columns, data, selectable, selectedRows = [], onSelect, sortKey, sortDirection, onSort,
}: TableProps<T>) {
  const allSelected = data.length > 0 && selectedRows.length === data.length
  const someSelected = selectedRows.length > 0 && !allSelected

  const toggleAll = () => onSelect?.(allSelected ? [] : data.map(r => r.id))
  const toggleRow = (id: string) => onSelect?.(selectedRows.includes(id) ? selectedRows.filter(r => r !== id) : [...selectedRows, id])

  return (
    <div className="rounded-[var(--radius-base)] border border-[var(--color-border-muted)] overflow-hidden">
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border-muted)]">
            {selectable && (
              <th className="w-10 pl-4 py-2.5">
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
              </th>
            )}
            {columns.map(col => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && onSort?.(col.key)}
                className={['px-4 py-2.5 text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide text-left', col.sortable ? 'cursor-pointer hover:text-[var(--color-text-secondary)]' : '', col.width ?? ''].filter(Boolean).join(' ')}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDirection === 'asc'
                      ? <ChevronUp size={12} className="text-[var(--color-text-primary)]" />
                      : <ChevronDown size={12} className="text-[var(--color-text-primary)]" />
                  )}
                  {col.sortable && sortKey !== col.key && (
                    <ChevronUp size={12} className="opacity-30" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            const isSelected = selectedRows.includes(row.id)
            return (
              <tr
                key={row.id}
                className={['border-b border-[var(--color-border-muted)] last:border-0 transition-[background] duration-100', isSelected ? 'bg-[var(--color-bg-overlay)]' : 'hover:bg-[var(--color-bg-surface)]'].join(' ')}
              >
                {selectable && (
                  <td className="w-10 pl-4 py-3">
                    <Checkbox checked={isSelected} onChange={() => toggleRow(row.id)} />
                  </td>
                )}
                {columns.map(col => (
                  <td key={String(col.key)} className="px-4 py-3 text-sm text-[var(--color-text-primary)]">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
```

---

#### Pagination

```tsx
// components/ui/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  variant?: 'inline' | 'sticky'
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function getPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, '...', total]
  if (current >= total - 2) return [1, '...', total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

export function Pagination({
  variant = 'inline', currentPage, totalPages, totalItems, pageSize,
  pageSizeOptions = [10, 20, 50, 100], onPageChange, onPageSizeChange,
}: PaginationProps) {
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)
  const pages = getPages(currentPage, totalPages)

  const content = (
    <>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          Rows per page
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="h-8 pl-2 pr-6 rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] text-sm text-[var(--color-text-primary)] outline-none appearance-none cursor-pointer"
          >
            {pageSizeOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <span className="text-sm text-[var(--color-text-secondary)]">
          Showing <span className="text-[var(--color-text-primary)]">{start}–{end}</span> of <span className="text-[var(--color-text-primary)]">{totalItems}</span>
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] text-[var(--color-text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-bg-raised)]"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={['w-8 h-8 flex items-center justify-center rounded-[var(--radius-sharp)] text-sm font-medium transition-[background] duration-150', currentPage === page ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-raised)]'].join(' ')}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] text-[var(--color-text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-bg-raised)]"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </>
  )

  if (variant === 'sticky') {
    return (
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-muted)]">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
      {content}
    </div>
  )
}
```

---

## 5. Patterns

### Sidebar Pattern

```tsx
// components/patterns/Sidebar.tsx
'use client'
import { useState } from 'react'
import { PanelLeft, Plus } from 'lucide-react'
import { NavItem } from '@/components/ui'

interface SidebarItem {
  label: string
  value: string
  icon?: React.ElementType
}

interface SidebarProps {
  items: SidebarItem[]
  activeValue: string
  onNavigate: (value: string) => void
  onNewComponent?: () => void
  onCollapse?:     (collapsed: boolean) => void
  brand?: string
  username?: string
}

export function Sidebar({
  items, activeValue, onNavigate, onNewComponent, onCollapse, brand = 'ComponentFactory', username,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const toggle = (v: boolean) => { setCollapsed(v); onCollapse?.(v) }

  return (
    <div
      className="flex flex-col h-screen bg-[var(--color-bg-surface)] border-r border-[var(--color-border-muted)] overflow-hidden overflow-x-hidden transition-[width] duration-[250ms] ease"
      style={{ width: collapsed ? 52 : 220, minWidth: collapsed ? 52 : 220 }}
    >
      <div className="h-[52px] flex-shrink-0 flex items-center border-b border-[var(--color-border-muted)] overflow-hidden px-2.5">
        {!collapsed && (
          <>
            <div className="w-7 h-7 min-w-[28px] rounded-[var(--radius-pill)] bg-[var(--color-accent-default)] flex items-center justify-center text-[11px] font-bold text-[var(--color-bg-page)]">CF</div>
            <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate flex-1 ml-2">{brand}</span>
          </>
        )}
        {collapsed && <div className="flex-1" />}
        <button
          onClick={() => toggle(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-7 h-7 min-w-[28px] flex-shrink-0 rounded-[var(--radius-sharp)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-[color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
        >
          <PanelLeft size={14} aria-hidden="true" />
        </button>
      </div>

      <div className={['px-2 pt-2 overflow-hidden', collapsed ? 'flex justify-center' : ''].join('')}>
        <button
          onClick={onNewComponent}
          className={[
            'flex items-center gap-2.5 h-9 rounded-[var(--radius-sharp)] text-sm font-medium text-[var(--color-text-secondary)]',
            'hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)] transition-[background,color] duration-150',
            collapsed ? 'w-9 justify-center' : 'w-full px-3',
          ].join(' ')}
        >
          <Plus size={16} />
          {!collapsed && 'New Component'}
        </button>
      </div>

      <div className="h-px bg-[var(--color-border-muted)] mx-2 my-1" />

      <div className="flex-1 flex flex-col gap-0.5 px-2 py-1 overflow-y-auto overflow-x-hidden">
        {items.map(item => (
          collapsed ? (
            <button
              key={item.value}
              onClick={() => onNavigate(item.value)}
              aria-label={item.label}
              aria-current={activeValue === item.value ? 'page' : undefined}
              className={[
                'w-9 h-9 flex items-center justify-center rounded-[var(--radius-sharp)] transition-[background,color] duration-150',
                activeValue === item.value
                  ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)]'
                  : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]',
              ].join(' ')}
            >
              {item.icon && <item.icon size={16} />}
            </button>
          ) : (
            <NavItem
              key={item.value}
              label={item.label}
              icon={item.icon}
              active={activeValue === item.value}
              onClick={() => onNavigate(item.value)}
            />
          )
        ))}
      </div>

      {username && (
        <div className="flex items-center gap-2 px-2.5 py-2.5 border-t border-[var(--color-border-muted)] overflow-hidden">
          <div className="w-7 h-7 min-w-[28px] rounded-[var(--radius-pill)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center text-[11px] font-semibold text-[var(--color-text-primary)]">
            {username[0].toUpperCase()}
          </div>
          {!collapsed && <span className="text-xs text-[var(--color-text-secondary)] truncate">{username}</span>}
        </div>
      )}
    </div>
  )
}
```

---

### Toolbar Pattern

```tsx
// components/patterns/Toolbar.tsx
import { Divider } from '@/components/ui'

interface ToolbarTab {
  label: string
  value: string
  icon?: React.ElementType
  badge?: number
}

interface ToolbarAction {
  icon?: React.ElementType
  label?: string
  onClick: () => void
  active?: boolean
  'aria-label'?: string
}

interface ToolbarProps {
  tabs?: ToolbarTab[]
  activeTab?: string
  onTabChange?: (value: string) => void
  actions?: ToolbarAction[]
  primaryAction?: { label: string; onClick: () => void }
}

export function Toolbar({ tabs, activeTab, onTabChange, actions, primaryAction }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] w-fit">
      {tabs?.map(tab => {
        const Icon = tab.icon
        const isActive = tab.value === activeTab
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange?.(tab.value)}
            className={[
              'flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--radius-sharp)] text-sm font-medium transition-[background,color] duration-150',
              isActive
                ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
            ].join(' ')}
          >
            {Icon && <Icon size={14} />}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={['text-[11px] font-medium px-1.5 py-px rounded-full border', isActive ? 'text-[var(--color-text-primary)] bg-[var(--color-border-muted)] border-[var(--color-border-focus)]' : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] border-[var(--color-border-muted)]'].join(' ')}>
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}

      {tabs && actions && <Divider orientation="vertical" className="mx-1" />}

      {actions?.map((action, i) => {
        const Icon = action.icon
        return (
          <button
            key={i}
            onClick={action.onClick}
            aria-label={action['aria-label'] ?? action.label}
            className={[
              'w-8 h-8 flex items-center justify-center rounded-[var(--radius-sharp)] text-sm font-medium transition-[background,color] duration-150',
              action.active
                ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)]'
                : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-raised)] hover:text-[var(--color-text-primary)]',
            ].join(' ')}
          >
            {Icon ? <Icon size={16} /> : action.label}
          </button>
        )
      })}

      {primaryAction && (
        <>
          {(tabs || actions) && <Divider orientation="vertical" className="mx-1" />}
          <button
            onClick={primaryAction.onClick}
            className="flex items-center h-8 px-3 rounded-[var(--radius-sharp)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-raised)] hover:text-[var(--color-text-primary)] transition-[background,color] duration-150"
          >
            {primaryAction.label}
          </button>
        </>
      )}
    </div>
  )
}
```

---

### Form Layout Pattern

```tsx
// components/patterns/FormLayout.tsx
interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

interface FormLayoutProps {
  title: string
  onSubmit: (e: React.FormEvent) => void
  footer: React.ReactNode
  children: React.ReactNode
  maxWidth?: number
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">{title}</p>
        {description && <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{description}</p>}
      </div>
      <div className="h-px bg-[var(--color-border-muted)]" />
      {children}
    </div>
  )
}

export function FormLayout({ title, onSubmit, footer, children, maxWidth = 640 }: FormLayoutProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] overflow-hidden"
      style={{ maxWidth }}
    >
      <div className="px-5 py-[18px] border-b border-[var(--color-border-muted)]">
        <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">{title}</h2>
      </div>

      <div className="px-5 py-5 flex flex-col gap-4">
        {children}
      </div>

      <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[var(--color-border-muted)]">
        {footer}
      </div>
    </form>
  )
}
```

---

### Empty State Pattern

```tsx
// components/patterns/EmptyState.tsx
import { Button } from '@/components/ui'

interface EmptyStateProps {
  icon: React.ElementType
  title: string
  description: string
  action?: { label: string; onClick: () => void; variant?: 'primary' | 'ghost' }
  danger?: boolean
}

export function EmptyState({ icon: Icon, title, description, action, danger }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-12 text-center rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
      <div className={[
        'w-14 h-14 rounded-[var(--radius-card)] flex items-center justify-center',
        danger
          ? 'bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)]'
          : 'bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)]',
      ].join(' ')}>
        <Icon size={24} className={danger ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-text-tertiary)]'} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-[280px] leading-relaxed">{description}</p>
      </div>
      {action && (
        <Button variant={action.variant ?? 'primary'} size="sm" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

---

## 9. Changelog

| Version | Date | Changes |
|---|---|---|
| `0.4.1` | 06/17/26 | Token bug fixes, code fixes, z-index corrections |
| `0.4.0` | 04/28/26 | Full token audit, radius tokens, ErrorBoundary, ToastContext |
| `0.3.0` | 04/28/26 | Token governance, motion system, patterns, barrel export |
| `0.2.0` | 04/27/26 | Primitive tokens, states, accessibility, layout system |
| `0.1.0` | 04/24/26 | Initial system |

---

*CF Design System — maintained by the Component Factory design team.*
