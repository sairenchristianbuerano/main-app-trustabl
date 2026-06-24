'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { BookOpen, GitCommit, GitPullRequest, AlertCircle } from 'lucide-react'
import { Modal, Button, Spinner } from '@/components/ui'
import { GitHubIcon } from './GitHubIcon'

type ModalState = 'initial' | 'waiting' | 'error'

interface GitHubConnectModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const GITHUB_OAUTH_URL = '/auth/github'
const OAUTH_TIMEOUT_MS = 120_000

const permissions = [
  { icon: BookOpen, label: 'Read repository contents' },
  { icon: GitCommit, label: 'Read commit metadata' },
  { icon: GitPullRequest, label: 'Create pull requests (for fixes)' },
]

export function GitHubConnectModal({ open, onClose, onSuccess }: GitHubConnectModalProps) {
  const [state, setState] = useState<ModalState>('initial')
  const [errorMessage, setErrorMessage] = useState('')
  const authWindowRef = useRef<Window | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (authWindowRef.current && !authWindowRef.current.closed) {
      authWindowRef.current.close()
    }
    authWindowRef.current = null
  }, [])

  const handleClose = useCallback(() => {
    cleanup()
    setState('initial')
    setErrorMessage('')
    onClose()
  }, [cleanup, onClose])

  const openAuthWindow = useCallback(() => {
    const w = 600
    const h = 700
    const left = window.screenX + (window.outerWidth - w) / 2
    const top = window.screenY + (window.outerHeight - h) / 2
    const popup = window.open(
      GITHUB_OAUTH_URL,
      'github-oauth',
      `width=${w},height=${h},left=${left},top=${top},popup=yes`,
    )
    authWindowRef.current = popup
    return popup
  }, [])

  const startOAuth = useCallback(() => {
    setState('waiting')
    setErrorMessage('')
    openAuthWindow()

    timeoutRef.current = setTimeout(() => {
      setState('error')
      setErrorMessage('Authorization timed out. Please try again.')
    }, OAUTH_TIMEOUT_MS)
  }, [openAuthWindow])

  useEffect(() => {
    if (!open || state !== 'waiting') return

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'github-oauth-success') {
        cleanup()
        setState('initial')
        onSuccess()
      }
      if (event.data?.type === 'github-oauth-error') {
        cleanup()
        setState('error')
        setErrorMessage(event.data.message || 'Authorization failed. Please try again.')
      }
    }

    window.addEventListener('message', handleMessage)

    const pollInterval = setInterval(() => {
      if (authWindowRef.current?.closed) {
        clearInterval(pollInterval)
      }
    }, 500)

    return () => {
      window.removeEventListener('message', handleMessage)
      clearInterval(pollInterval)
    }
  }, [open, state, cleanup, onSuccess])

  useEffect(() => {
    if (!open) {
      cleanup()
      setState('initial')
      setErrorMessage('')
    }
  }, [open, cleanup])

  if (state === 'waiting') {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Waiting for GitHub authorization..."
        footer={
          <>
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button variant="secondary" onClick={openAuthWindow}>Open auth tab again</Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <Spinner size="md" />
          <p className="text-sm text-[var(--color-text-secondary)] text-center leading-relaxed">
            Complete the authorization in the new tab.
          </p>
        </div>
      </Modal>
    )
  }

  if (state === 'error') {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Authorization failed"
        footer={
          <>
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={startOAuth}>Try again</Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-12 h-12 rounded-[var(--radius-base)] bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] flex items-center justify-center">
            <AlertCircle size={24} className="text-[var(--color-danger-text)]" />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] text-center leading-relaxed max-w-[320px]">
            {errorMessage}
          </p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Connect GitHub"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button onClick={startOAuth}>
            <GitHubIcon size={16} />
            Connect GitHub
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 pt-1">
          <div className="w-12 h-12 rounded-[var(--radius-base)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center">
            <GitHubIcon size={24} className="text-[var(--color-text-tertiary)]" />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] text-center leading-relaxed">
            Trustabl needs access to your GitHub repositories<br />to scan AI agents for production gaps.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] bg-[var(--color-bg-raised)] p-3.5">
          <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Permissions</p>
          {permissions.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
