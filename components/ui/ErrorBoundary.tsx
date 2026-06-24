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
        <div className="flex flex-col items-center gap-3 p-12 text-center border border-[var(--color-border-muted)] rounded-[var(--radius-card)] bg-[var(--color-bg-surface)]">
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
