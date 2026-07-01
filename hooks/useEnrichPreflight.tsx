'use client'
import { useCallback, useState } from 'react'
import { FeatureGateModal } from '@/components/ui'
import { LlmNotConfiguredModal } from '@/components/patterns/preflight/LlmNotConfiguredModal'
import { fetchIntegrationsSettings, postEnrichFinding } from '@/lib/preflight'

type ModalState = 'feature-gate' | 'llm' | null

/**
 * Single source of truth for the Enrichment pre-flight check sequence:
 * enrichment_enabled -> llm_configured -> POST /api/findings/{id}/enrich.
 * No Docker check — enrichment only sends text to the LLM API.
 */
export function useEnrichPreflight(onProceed: (findingId: string) => void) {
  const [modal, setModal] = useState<ModalState>(null)
  const [checking, setChecking] = useState(false)

  const run = useCallback(async (findingId: string) => {
    setChecking(true)
    try {
      const settings = await fetchIntegrationsSettings()
      if (!settings.enrichment_enabled) { setModal('feature-gate'); return }
      if (!settings.llm_configured) { setModal('llm'); return }

      await postEnrichFinding(findingId)
      onProceed(findingId)
    } finally {
      setChecking(false)
    }
  }, [onProceed])

  const modals = (
    <>
      <FeatureGateModal open={modal === 'feature-gate'} feature="enrichment" onClose={() => setModal(null)} />
      <LlmNotConfiguredModal open={modal === 'llm'} onClose={() => setModal(null)} />
    </>
  )

  return { run, checking, modals }
}
