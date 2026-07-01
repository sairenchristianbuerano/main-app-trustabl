'use client'
import { useCallback, useState } from 'react'
import { FeatureGateModal } from '@/components/ui'
import { LlmNotConfiguredModal } from '@/components/patterns/preflight/LlmNotConfiguredModal'
import { DockerNotRunningModal } from '@/components/patterns/preflight/DockerNotRunningModal'
import { fetchIntegrationsSettings, fetchDockerStatus, postAutofixRun } from '@/lib/preflight'

type ModalState = 'feature-gate' | 'llm' | 'docker' | null

/**
 * Single source of truth for the Autofix pre-flight check sequence:
 * autofix_enabled -> llm_configured -> docker_running -> POST /api/autofix/run.
 * Call `run(repoIds)` from any "Run autofix" trigger; render `modals` alongside it.
 */
export function useAutofixPreflight(onProceed: (repoIds: string | string[]) => void) {
  const [modal, setModal] = useState<ModalState>(null)
  const [checking, setChecking] = useState(false)
  const [pendingIds, setPendingIds] = useState<string | string[] | null>(null)

  const startRun = useCallback(async (repoIds: string | string[]) => {
    const ids = Array.isArray(repoIds) ? repoIds : [repoIds]
    await Promise.all(ids.map(id => postAutofixRun(id)))
    onProceed(repoIds)
  }, [onProceed])

  const run = useCallback(async (repoIds: string | string[]) => {
    setChecking(true)
    try {
      const settings = await fetchIntegrationsSettings()
      if (!settings.autofix_enabled) { setModal('feature-gate'); return }
      if (!settings.llm_configured) { setModal('llm'); return }

      const docker = await fetchDockerStatus()
      if (!docker.running) { setPendingIds(repoIds); setModal('docker'); return }

      await startRun(repoIds)
    } finally {
      setChecking(false)
    }
  }, [startRun])

  const handleDockerConfirm = useCallback(async () => {
    if (!pendingIds) return
    setModal(null)
    await startRun(pendingIds)
    setPendingIds(null)
  }, [pendingIds, startRun])

  const modals = (
    <>
      <FeatureGateModal open={modal === 'feature-gate'} feature="autofix" onClose={() => setModal(null)} />
      <LlmNotConfiguredModal open={modal === 'llm'} onClose={() => setModal(null)} />
      <DockerNotRunningModal
        open={modal === 'docker'}
        onClose={() => { setModal(null); setPendingIds(null) }}
        onConfirm={handleDockerConfirm}
      />
    </>
  )

  return { run, checking, modals }
}
