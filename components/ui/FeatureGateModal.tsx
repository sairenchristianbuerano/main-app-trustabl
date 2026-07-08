'use client'
import { useRouter } from 'next/navigation'
import { Wrench, Sparkles, Zap, Eye, Check, Search, Lightbulb } from 'lucide-react'
import { Modal, Button } from '@/components/ui'

export type FeatureGate = 'autofix' | 'enrichment'

interface Props {
  open: boolean
  feature: FeatureGate
  onClose: () => void
}

const CONFIG = {
  autofix: {
    icon: Wrench,
    iconBg: { backgroundColor: 'var(--color-ai-bg)' },
    iconColor: { color: 'var(--color-ai-text)' },
    title: 'Autofix is not enabled',
    body: 'Autofix automatically generates exact code fixes for your findings. Review each fix, accept what looks good, and ship cleaner agent code faster.',
    highlights: [
      { Icon: Zap,    text: 'AI-generated code fixes per finding' },
      { Icon: Eye,    text: 'Review diffs before applying anything' },
      { Icon: Check,  text: 'Accept or reject each fix individually' },
    ],
    cta: 'Enable Autofix →',
    param: 'autofix',
  },
  enrichment: {
    icon: Sparkles,
    iconBg: { backgroundColor: 'var(--color-accent-subtle)' },
    iconColor: { color: 'var(--color-accent-default)' },
    title: 'Enrichment is not enabled',
    body: 'Enrichment uses AI to generate detailed explanations and exact code fixes for your findings. Understand issues faster and fix them with confidence.',
    highlights: [
      { Icon: Search,    text: 'Detailed AI explanation per finding' },
      { Icon: Lightbulb, text: 'Exact code fix with diff view' },
      { Icon: Zap,       text: 'Enrich one finding or all at once' },
    ],
    cta: 'Enable Enrichment →',
    param: 'enrichment',
  },
}

export function FeatureGateModal({ open, feature, onClose }: Props) {
  const router = useRouter()
  const cfg = CONFIG[feature]
  const Icon = cfg.icon

  const handleEnable = () => {
    onClose()
    router.push(`/settings/integrations?highlight=${cfg.param}`)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={cfg.title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Maybe later</Button>
          <Button variant="primary" onClick={handleEnable}>{cfg.cta}</Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-5 pt-1">
        <div
          className="w-[52px] h-[52px] rounded-[var(--radius-card)] flex items-center justify-center flex-shrink-0"
          style={cfg.iconBg}
        >
          <Icon size={24} style={cfg.iconColor} />
        </div>

        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed text-center max-w-[320px]">
          {cfg.body}
        </p>

        <div className="w-full flex flex-col gap-2">
          {cfg.highlights.map(({ Icon: HIcon, text }, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-base)] bg-[var(--color-bg-raised)]">
              <HIcon size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              <span className="text-sm text-[var(--color-text-secondary)]">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
