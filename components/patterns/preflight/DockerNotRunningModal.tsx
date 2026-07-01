'use client'
import { useState } from 'react'
import { Modal, Button } from '@/components/ui'
import { fetchDockerStatus } from '@/lib/preflight'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DockerNotRunningModal({ open, onClose, onConfirm }: Props) {
  const [retrying, setRetrying] = useState(false)

  const handleRetry = async () => {
    setRetrying(true)
    const status = await fetchDockerStatus()
    if (status.running) onConfirm()
    setRetrying(false)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Docker is not running"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={retrying} onClick={handleRetry}>Retry</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 pt-1">
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Autofix runs findings in a sandboxed Docker environment. Start Docker, then retry.
        </p>
      </div>
    </Modal>
  )
}
