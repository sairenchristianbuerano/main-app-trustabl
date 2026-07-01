'use client'
import { useRouter } from 'next/navigation'
import { Key } from 'lucide-react'
import { Modal, Button } from '@/components/ui'

interface Props {
  open: boolean
  onClose: () => void
}

export function LlmNotConfiguredModal({ open, onClose }: Props) {
  const router = useRouter()

  const handleGoToSettings = () => {
    onClose()
    router.push('/settings/integrations?highlight=llm')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="LLM not configured"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleGoToSettings}>Go to Settings</Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 pt-1">
        <div
          className="w-[52px] h-[52px] rounded-[var(--radius-card)] flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-info-bg)' }}
        >
          <Key size={22} className="text-[var(--color-info-text)]" />
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed text-center max-w-[320px]">
          Autofix requires an LLM provider to generate code fixes. Add your API key in Settings to continue.
        </p>
      </div>
    </Modal>
  )
}
