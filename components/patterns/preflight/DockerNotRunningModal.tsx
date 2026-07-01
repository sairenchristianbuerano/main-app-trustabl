'use client'
import { useEffect, useRef, useState } from 'react'
import { Container } from 'lucide-react'
import { Modal, Button } from '@/components/ui'
import { fetchDockerStatus } from '@/lib/preflight'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DockerNotRunningModal({ open, onClose, onConfirm }: Props) {
  const [running, setRunning] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [retryMessage, setRetryMessage] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!open) {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }
    setRunning(false)
    setRetryMessage(null)
    const check = async () => {
      const status = await fetchDockerStatus()
      setRunning(status.running)
    }
    check()
    pollRef.current = setInterval(check, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [open])

  const handleRetry = async () => {
    setRetrying(true)
    setRetryMessage(null)
    const status = await fetchDockerStatus()
    setRunning(status.running)
    if (!status.running) setRetryMessage('Docker still not detected. Make sure Docker Desktop is running and try again.')
    setRetrying(false)
  }

  const handleClose = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    onClose()
  }

  const handleConfirm = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    onConfirm()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Docker is not running"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          {running ? (
            <Button variant="primary" onClick={handleConfirm}>Run autofix</Button>
          ) : (
            <Button variant="secondary" loading={retrying} onClick={handleRetry}>Retry</Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4 pt-1">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-[52px] h-[52px] rounded-[var(--radius-card)] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-danger-bg)' }}
          >
            <Container size={22} className="text-[var(--color-danger-text)]" />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed text-center max-w-[320px]">
            Autofix requires Docker to run findings in a sandboxed environment. Please start Docker on this machine and try again.
          </p>
        </div>

        <div className="flex items-center gap-2 justify-center rounded-[var(--radius-base)] bg-[var(--color-bg-raised)] px-3 py-2.5">
          <span className={['w-2 h-2 rounded-full', running ? 'bg-[var(--color-success-text)]' : 'bg-[var(--color-danger-text)]'].join(' ')} />
          <span className={['text-xs font-medium', running ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'].join(' ')}>
            {running ? 'Docker is running — ready to go' : 'Docker not detected'}
          </span>
        </div>

        {retryMessage && (
          <p className="text-xs text-[var(--color-danger-text)] text-center">{retryMessage}</p>
        )}
      </div>
    </Modal>
  )
}
