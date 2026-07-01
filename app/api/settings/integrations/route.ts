import { NextRequest, NextResponse } from 'next/server'

interface Store {
  enrichment_enabled: boolean
  autofix_enabled: boolean
  llm_provider: string | null
  llm_api_key: string | null
}

// In-memory mock store — mirrors the localStorage-based config this prototype
// otherwise keeps client-side, so server-side preflight checks have something to read.
const store: Store = {
  enrichment_enabled: false,
  autofix_enabled: false,
  llm_provider: null,
  llm_api_key: null,
}

function maskKey(key: string) {
  if (key.length <= 4) return '*'.repeat(key.length)
  return `sk-${'*'.repeat(15)}${key.slice(-4)}`
}

export async function GET() {
  return NextResponse.json({
    enrichment_enabled: store.enrichment_enabled,
    autofix_enabled: store.autofix_enabled,
    llm_configured: !!store.llm_api_key,
    llm_provider: store.llm_provider,
    llm_api_key_masked: store.llm_api_key ? maskKey(store.llm_api_key) : null,
    muted_repos: [],
  })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  if (typeof body.enrichment_enabled === 'boolean') store.enrichment_enabled = body.enrichment_enabled
  if (typeof body.autofix_enabled === 'boolean') store.autofix_enabled = body.autofix_enabled
  if ('llm_provider' in body) store.llm_provider = body.llm_provider
  if ('llm_api_key' in body) store.llm_api_key = body.llm_api_key
  return NextResponse.json({ ok: true })
}
