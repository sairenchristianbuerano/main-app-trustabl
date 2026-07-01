import { MOCK_DETAILS } from '../repositories/[id]/mock-data'

export type AutofixStatus = 'not_run' | 'running' | 'ready' | 'completed'
export type FixStatus = 'pending' | 'running' | 'ready' | 'applied' | 'rejected'

export interface AttestationData {
  schema: string
  generated_at: string
  source: string
  score: number
  network_calls: string[]
  file_writes: string[]
  source_hash: string
  signing: {
    signed: boolean
    issuer: string
    identity: string
    rekor_log: boolean
    fulcio_cert: boolean
    sha256: string
  }
  policy: {
    filename: string
    content: string
  }
}

export interface AutofixRepo {
  repo_id: string
  repo_name: string
  scan_id: string
  autofix_status: AutofixStatus
  fixes_ready: number
  fixes_applied: number
  fixes_rejected: number
  last_run_at: string
  last_run_by: string
}

export interface AutofixFinding {
  finding_id: string
  rule_id: string
  severity: string
  title: string
  scope: string
  tool_name: string
  file_path: string
  start_line: number
  end_line: number
  fix_status: FixStatus
  code_snippet?: string
  replacement?: string
  ai_fix?: string
  applied_at?: string
  applied_by?: string
  rejected_at?: string
  rejected_by?: string
}

export interface AutofixSession {
  id: string
  repo_id: string
  repo_name: string
  scan_id: string
  status: 'running' | 'completed'
  created_at: string
  created_by: string
  findings: AutofixFinding[]
}

function isFixable(finding: { fix: string; description: string; policyId: string }): boolean {
  if (!finding.fix || finding.fix.trim() === '') return false
  const desc = finding.description?.toLowerCase() || ''
  if (desc.includes('opaque') || desc.includes('cannot evaluate') || desc.includes('non-literal')) return false
  if (finding.policyId.startsWith('META-')) return false
  return true
}

export function getAutofixRepos(): AutofixRepo[] {
  const repos: AutofixRepo[] = []

  const entries = Object.entries(MOCK_DETAILS)
  entries.forEach(([name, detail], i) => {
    const fixable = detail.findings.filter(f => isFixable(f))
    if (fixable.length === 0) return

    let status: AutofixStatus = 'not_run'
    let fixesReady = 0
    let fixesApplied = 0
    let fixesRejected = 0
    let lastRunAt = ''
    let lastRunBy = ''

    if (i === 0) {
      status = 'ready'
      fixesReady = Math.min(fixable.length, 12)
      fixesApplied = 0
      fixesRejected = 0
      lastRunAt = '2 hours ago'
      lastRunBy = 'Zane F.'
    } else if (i === 1) {
      status = 'ready'
      fixesReady = Math.min(fixable.length, 10)
      fixesApplied = 0
      fixesRejected = 0
      lastRunAt = '1 day ago'
      lastRunBy = 'Zane F.'
    } else if (i === 2) {
      status = 'not_run'
    } else if (i === 3) {
      status = 'ready'
      fixesReady = Math.min(fixable.length, 18)
      fixesApplied = 0
      fixesRejected = 0
      lastRunAt = '5 days ago'
      lastRunBy = 'Alex M.'
    } else {
      status = 'not_run'
    }

    repos.push({
      repo_id: name,
      repo_name: name,
      scan_id: detail.scan.id,
      autofix_status: status,
      fixes_ready: fixesReady,
      fixes_applied: fixesApplied,
      fixes_rejected: fixesRejected,
      last_run_at: lastRunAt,
      last_run_by: lastRunBy,
    })
  })

  return repos
}

function generateCodeSnippet(finding: { location: string; title: string }): string {
  const file = finding.location.split(':')[0]
  const line = finding.location.split(':')[1] || '1'
  return `// ${file}:${line}\n// Current implementation\nfunction handle() {\n  // ${finding.title.toLowerCase()}\n  return process(input)\n}`
}

function generateReplacement(finding: { location: string; policyId: string }): string {
  const file = finding.location.split(':')[0]
  const line = finding.location.split(':')[1] || '1'
  return `// ${file}:${line}\n// Fixed implementation\nfunction handle() {\n  const validated = validate(input)\n  try {\n    return process(validated)\n  } catch (err) {\n    logger.error('${finding.policyId}', { err })\n    return fallback(err)\n  }\n}`
}

// Autofix tab uses a 3-level severity (critical/warning/info), collapsed from the
// scanner's 4-level severity (critical/high/medium/low). Scanner tab keeps the original 4.
function toAutofixSeverity(severity: string): 'critical' | 'warning' | 'info' {
  if (severity === 'critical') return 'critical'
  if (severity === 'high' || severity === 'medium') return 'warning'
  return 'info'
}

export function getAutofixSession(repoName: string): AutofixSession | null {
  const detail = MOCK_DETAILS[repoName]
  if (!detail) return null

  const repos = getAutofixRepos()
  const repo = repos.find(r => r.repo_name === repoName)
  if (!repo || repo.autofix_status === 'not_run') return null

  const fixable = detail.findings.filter(f => isFixable(f))

  const findings: AutofixFinding[] = fixable.map((f, i) => {
    let fixStatus: FixStatus = 'ready'

    if (repo.autofix_status === 'completed') {
      fixStatus = 'applied'
    } else if (i < repo.fixes_applied) {
      fixStatus = 'applied'
    } else if (i < repo.fixes_applied + repo.fixes_rejected) {
      fixStatus = 'rejected'
    } else if (i < repo.fixes_applied + repo.fixes_rejected + repo.fixes_ready) {
      fixStatus = 'ready'
    }

    const location = f.location || 'src/unknown.ts:1'
    const filePath = location.split(':')[0]
    const startLine = parseInt(location.split(':')[1] || '1', 10)

    return {
      finding_id: `af-${repoName}-${f.id}`,
      rule_id: f.policyId,
      severity: toAutofixSeverity(f.severity),
      title: f.title,
      scope: f.scope,
      tool_name: f.tool_name,
      file_path: filePath,
      start_line: startLine,
      end_line: startLine + 8,
      fix_status: fixStatus,
      code_snippet: fixStatus === 'ready' || fixStatus === 'applied' || fixStatus === 'rejected'
        ? generateCodeSnippet(f) : undefined,
      replacement: fixStatus === 'ready' || fixStatus === 'applied' || fixStatus === 'rejected'
        ? generateReplacement(f) : undefined,
      ai_fix: fixStatus === 'ready' || fixStatus === 'applied' || fixStatus === 'rejected'
        ? `Apply the following change to ${filePath} starting at line ${startLine}: ${f.fix}` : undefined,
      applied_at: fixStatus === 'applied' ? '2 hours ago' : undefined,
      applied_by: fixStatus === 'applied' ? 'Zane F.' : undefined,
      rejected_at: fixStatus === 'rejected' ? '1 hour ago' : undefined,
      rejected_by: fixStatus === 'rejected' ? 'Zane F.' : undefined,
    }
  })

  return {
    id: `ses_${repoName.slice(0, 6)}_001`,
    repo_id: repoName,
    repo_name: repoName,
    scan_id: detail.scan.id,
    status: 'completed',
    created_at: repo.last_run_at || 'Just now',
    created_by: repo.last_run_by || 'Zane F.',
    findings,
  }
}

export function generateAttestation(repoName: string, sessionId: string): AttestationData {
  const hash = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  const sha = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')

  const policyYaml = `network_policies:
  allow:
    - host: api.openai.com
      port: 443
      protocol: https
      direction: egress
    - host: registry.npmjs.org
      port: 443
      protocol: https
      direction: egress
filesystem_policies:
  read:
    - /src/**/*.ts
    - /src/**/*.tsx
    - /package.json
    - /tsconfig.json
  write: []
process_policies:
  allow:
    - node
    - npm
  deny:
    - curl
    - wget`

  return {
    schema: 'v1.0',
    generated_at: new Date().toISOString(),
    source: `repos/${repoName}/src`,
    score: 82 + Math.floor(Math.random() * 16),
    network_calls: ['api.openai.com:443', 'registry.npmjs.org:443'],
    file_writes: ['none detected'],
    source_hash: hash,
    signing: {
      signed: true,
      issuer: 'https://accounts.google.com',
      identity: 'zanexflores@gmail.com',
      rekor_log: true,
      fulcio_cert: true,
      sha256: sha,
    },
    policy: {
      filename: 'autofix-policy.yaml',
      content: policyYaml,
    },
  }
}
