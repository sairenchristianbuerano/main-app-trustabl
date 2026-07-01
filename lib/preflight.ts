export async function fetchDockerStatus(): Promise<{ running: boolean }> {
  const res = await fetch('/api/system/docker-status', { cache: 'no-store' })
  return res.json()
}

export async function postAutofixRun(repoId: string): Promise<void> {
  await fetch('/api/autofix/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_id: repoId }),
  })
}

export async function postEnrichFinding(findingId: string): Promise<void> {
  await fetch(`/api/findings/${encodeURIComponent(findingId)}/enrich`, { method: 'POST' })
}
