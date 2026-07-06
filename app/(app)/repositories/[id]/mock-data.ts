export interface Finding {
  id: string
  policyId: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  scope: 'skill' | 'agent' | 'tool'
  location: string
  status: 'open' | 'resolved' | 'ignored'
  description: string
  fix: string
  confidence: number
  tool_name: string
  enriched: boolean
  ai_explanation?: string
  ai_fix?: string
  code_snippet?: string
  replacement?: string
}

export interface Surface {
  name: string
  path: string
  type: 'skill' | 'agent' | 'tool'
  findings_count: number
  readiness: number
}

export interface ActivityItem {
  action: string
  timestamp: string
  user: string
  type: 'scan' | 'fix' | 'ignore' | 'add'
}

export interface ScanComparison {
  previous_scan_at: string
  new_findings: string[]
  fixed_findings: Finding[]
  changed_findings: { finding_id: string; previous_severity: Finding['severity']; current_severity: Finding['severity'] }[]
  unchanged_findings: string[]
}

export interface RepoDetail {
  repo: {
    name: string
    framework: string
    language: string
    readiness_score: number
    gate_status: 'pass' | 'fail'
    findings_count: number
    surfaces_count: number
  }
  scan: {
    id: string
    tags: string[]
    readiness_fix_critical: number
    readiness_fix_all: number
  }
  findings: Finding[]
  surfaces: Surface[]
  activity: ActivityItem[]
}

export const MOCK_DETAILS: Record<string, RepoDetail> = {
  'ai-chatbot': {
    repo: { name: 'ai-chatbot', framework: 'Next.js', language: 'TypeScript', readiness_score: 42, gate_status: 'fail', findings_count: 19, surfaces_count: 4 },
    scan: { id: 'scn_8f3a2b1c', tags: ['deterministic', 'reproducible', 'unsigned', 'offline'], readiness_fix_critical: 68, readiness_fix_all: 95 },
    findings: [
      { id: 'f1', policyId: 'CAGENT-001', severity: 'critical', title: 'No error boundary around LLM call', scope: 'agent', location: 'src/agents/chat.ts:42', status: 'open', description: 'LLM API calls can throw network errors, rate limit errors, or return malformed responses. Without an error boundary, these propagate as unhandled exceptions and crash the process.', fix: 'Wrap the LLM call in a try/catch block. Handle specific error types (network, rate limit, malformed response) with appropriate fallbacks.', confidence: 95, tool_name: 'semgrep', enriched: false },
      { id: 'f2', policyId: 'CTOOL-001', severity: 'critical', title: 'Missing retry logic on tool execution', scope: 'tool', location: 'src/tools/search.ts:18', status: 'open', description: 'Tool calls to external APIs have no retry mechanism. Transient failures cause permanent task failure.', fix: 'Add exponential backoff retry with max 3 attempts. Use a circuit breaker for sustained failures.', confidence: 92, tool_name: 'semgrep', enriched: false },
      { id: 'f3', policyId: 'CSKILL-001', severity: 'critical', title: 'User input passed directly to prompt', scope: 'skill', location: 'src/skills/summarize.ts:31', status: 'open', description: 'Raw user input is concatenated into the prompt template without sanitization. This enables prompt injection attacks.', fix: 'Sanitize user input before interpolation. Use parameterized prompt templates instead of string concatenation.', confidence: 98, tool_name: 'prompt-guard', enriched: false },
      { id: 'f4', policyId: 'CAGENT-002', severity: 'high', title: 'No timeout on agent execution loop', scope: 'agent', location: 'src/agents/chat.ts:67', status: 'open', description: 'Agent can enter infinite loops with no timeout, consuming resources indefinitely.', fix: 'Add a max iteration count and wall-clock timeout to the agent loop.', confidence: 88, tool_name: 'agent-lint', enriched: false },
      { id: 'f5', policyId: 'CAGENT-003', severity: 'high', title: 'Missing output validation', scope: 'agent', location: 'src/agents/chat.ts:95', status: 'open', description: 'Agent output is returned directly without schema validation, allowing malformed data to reach users.', fix: 'Add Zod schema validation on agent output before returning to caller.', confidence: 85, tool_name: 'agent-lint', enriched: false },
      { id: 'f6', policyId: 'CSKILL-002', severity: 'high', title: 'No rate limiting on API endpoint', scope: 'skill', location: 'src/api/chat.ts:12', status: 'open', description: 'Chat endpoint has no rate limiting, allowing abuse and cost overruns.', fix: 'Add per-user rate limiting middleware with configurable thresholds.', confidence: 90, tool_name: 'semgrep', enriched: false },
      { id: 'f7', policyId: 'CAGENT-004', severity: 'medium', title: 'Hardcoded model identifier', scope: 'agent', location: 'src/agents/chat.ts:8', status: 'open', description: 'Model name is hardcoded instead of configurable, making model upgrades require code changes.', fix: 'Move model identifier to environment variable or configuration file.', confidence: 75, tool_name: 'agent-lint', enriched: false },
      { id: 'f8', policyId: 'CTOOL-002', severity: 'medium', title: 'No structured logging', scope: 'tool', location: 'src/tools/search.ts:5', status: 'open', description: 'Uses console.log for debugging. No structured logging for production observability.', fix: 'Replace console.log with structured logger (e.g., pino) with correlation IDs.', confidence: 70, tool_name: 'semgrep', enriched: false },
      { id: 'f9', policyId: 'CAGENT-005', severity: 'medium', title: 'Missing cost tracking', scope: 'agent', location: 'src/agents/chat.ts:55', status: 'open', description: 'No token usage tracking per request. Cannot monitor or cap costs.', fix: 'Track input/output tokens per call. Aggregate per user/session. Set usage alerts.', confidence: 80, tool_name: 'agent-lint', enriched: false },
      { id: 'f10', policyId: 'CTOOL-003', severity: 'low', title: 'Unused environment variable', scope: 'tool', location: 'src/config.ts:14', status: 'open', description: 'OPENAI_ORG_ID is referenced in config but never used in code.', fix: 'Remove unused variable or wire it into the API client configuration.', confidence: 60, tool_name: 'semgrep', enriched: false },
      { id: 'f11', policyId: 'CAGENT-006', severity: 'high', title: 'No graceful shutdown handler', scope: 'agent', location: 'src/server.ts:1', status: 'open', description: 'Server does not handle SIGTERM/SIGINT. In-flight requests are dropped on deploy.', fix: 'Add graceful shutdown that finishes in-flight requests before exiting.', confidence: 87, tool_name: 'agent-lint', enriched: false },
      { id: 'f12', policyId: 'CSKILL-003', severity: 'medium', title: 'Prompt template not versioned', scope: 'skill', location: 'src/skills/summarize.ts:5', status: 'open', description: 'Prompt templates are inline strings with no versioning. Changes are hard to track and rollback.', fix: 'Move prompts to versioned files or a prompt registry.', confidence: 72, tool_name: 'prompt-guard', enriched: false },
      { id: 'f13', policyId: 'CSKILL-004', severity: 'high', title: 'No input length validation', scope: 'skill', location: 'src/skills/summarize.ts:22', status: 'open', description: 'User can submit arbitrarily long input, causing token limit errors and high costs.', fix: 'Validate input length before sending to LLM. Return clear error for oversized input.', confidence: 91, tool_name: 'prompt-guard', enriched: false },
      { id: 'f14', policyId: 'CTOOL-004', severity: 'medium', title: 'Missing health check endpoint', scope: 'tool', location: 'src/server.ts:30', status: 'open', description: 'No /health endpoint for load balancer and monitoring.', fix: 'Add a /health endpoint that checks LLM API connectivity and returns status.', confidence: 65, tool_name: 'semgrep', enriched: false },
      { id: 'f15', policyId: 'CAGENT-007', severity: 'low', title: 'Console warnings in production', scope: 'agent', location: 'src/agents/chat.ts:120', status: 'open', description: 'Development console.warn statements left in production code.', fix: 'Remove or gate behind NODE_ENV check.', confidence: 55, tool_name: 'agent-lint', enriched: false },
      { id: 'f16', policyId: 'CTOOL-005', severity: 'critical', title: 'API key exposed in client bundle', scope: 'tool', location: 'src/config.ts:3', status: 'open', description: 'NEXT_PUBLIC_ prefix on API key makes it available in client-side JavaScript.', fix: 'Remove NEXT_PUBLIC_ prefix. Route API calls through a server-side endpoint.', confidence: 99, tool_name: 'secret-scanner', enriched: false },
      { id: 'f17', policyId: 'CAGENT-008', severity: 'high', title: 'No conversation memory limit', scope: 'agent', location: 'src/agents/chat.ts:78', status: 'open', description: 'Conversation history grows unbounded, eventually exceeding context window.', fix: 'Implement sliding window or summarization for conversation history.', confidence: 86, tool_name: 'agent-lint', enriched: false },
      { id: 'f18', policyId: 'CTOOL-006', severity: 'medium', title: 'Missing CORS configuration', scope: 'tool', location: 'src/server.ts:8', status: 'open', description: 'No CORS headers configured. API is either fully open or blocks all cross-origin requests.', fix: 'Add explicit CORS configuration with allowed origins.', confidence: 68, tool_name: 'semgrep', enriched: false },
      { id: 'f19', policyId: 'META-003', severity: 'medium', title: 'Opaque model configuration', scope: 'agent', location: 'src/config/models.ts:5', status: 'open', description: 'Model configuration uses dynamic runtime values that cannot be statically analyzed. Configuration is assembled from environment variables, feature flags, and runtime conditions.', fix: 'Extract static configuration from dynamic logic where possible. Document runtime-only configuration separately.', confidence: 40, tool_name: 'meta-analyzer', enriched: false },
    ],
    surfaces: [
      { name: 'Chat Agent', path: 'src/agents/chat.ts', type: 'agent', findings_count: 8, readiness: 35 },
      { name: 'Summarize Skill', path: 'src/skills/summarize.md', type: 'skill', findings_count: 4, readiness: 50 },
      { name: 'Search Tool', path: 'src/tools/search.ts', type: 'tool', findings_count: 3, readiness: 60 },
      { name: 'Server Config', path: 'src/server.ts', type: 'tool', findings_count: 3, readiness: 45 },
    ],
    activity: [
      { action: 'Scan completed — 19 findings detected', timestamp: '2 hours ago', user: 'Zane F.', type: 'scan' },
      { action: 'Ignored "Missing cost tracking"', timestamp: '45 min ago', user: 'Zane F.', type: 'ignore' },
      { action: 'Repository added', timestamp: '3 hours ago', user: 'Zane F.', type: 'add' },
    ],
  },

  'agent-pipeline': {
    repo: { name: 'agent-pipeline', framework: 'FastAPI', language: 'Python', readiness_score: 94, gate_status: 'pass', findings_count: 2, surfaces_count: 2 },
    scan: { id: 'scn_4b2c9e1a', tags: ['deterministic', 'reproducible', 'offline'], readiness_fix_critical: 100, readiness_fix_all: 100 },
    findings: [
      { id: 'f1', policyId: 'CTOOL-007', severity: 'low', title: 'Deprecated dependency version', scope: 'tool', location: 'requirements.txt:12', status: 'open', description: 'langchain==0.1.x is deprecated. Newer versions contain security patches.', fix: 'Upgrade to langchain>=0.2.0 and test for breaking changes.', confidence: 65, tool_name: 'semgrep', enriched: false },
      { id: 'f2', policyId: 'CAGENT-009', severity: 'medium', title: 'No request timeout on pipeline steps', scope: 'agent', location: 'src/pipeline/runner.py:45', status: 'open', description: 'Individual pipeline steps have no timeout. A slow step blocks the entire pipeline.', fix: 'Add per-step timeout with configurable defaults. Cancel and report on timeout.', confidence: 78, tool_name: 'agent-lint', enriched: false },
    ],
    surfaces: [
      { name: 'Pipeline Runner', path: 'src/pipeline/runner.py', type: 'agent', findings_count: 1, readiness: 92 },
      { name: 'Dependencies', path: 'requirements.txt', type: 'tool', findings_count: 1, readiness: 90 },
    ],
    activity: [
      { action: 'Scan completed — 2 findings detected', timestamp: '1 day ago', user: 'Zane F.', type: 'scan' },
      { action: 'Repository added', timestamp: '2 days ago', user: 'Zane F.', type: 'add' },
    ],
  },

  'llm-gateway': {
    repo: { name: 'llm-gateway', framework: 'Gin', language: 'Go', readiness_score: 71, gate_status: 'fail', findings_count: 8, surfaces_count: 3 },
    scan: { id: 'scn_7d1f3e4b', tags: ['deterministic', 'reproducible', 'unsigned'], readiness_fix_critical: 85, readiness_fix_all: 96 },
    findings: [
      { id: 'f1', policyId: 'CTOOL-008', severity: 'critical', title: 'No circuit breaker on upstream LLM providers', scope: 'tool', location: 'pkg/proxy/handler.go:34', status: 'open', description: 'When an upstream LLM provider goes down, the gateway continues sending requests, cascading the failure to all clients.', fix: 'Implement a circuit breaker pattern. After N consecutive failures, stop routing to the failing provider and failover to alternatives.', confidence: 94, tool_name: 'semgrep', enriched: false },
      { id: 'f2', policyId: 'CTOOL-009', severity: 'high', title: 'API keys stored in plaintext config', scope: 'tool', location: 'config/providers.yaml:8', status: 'open', description: 'Provider API keys are stored as plaintext values in a YAML config file committed to the repo.', fix: 'Move API keys to environment variables or a secrets manager. Reference by name in config.', confidence: 96, tool_name: 'secret-scanner', enriched: false },
      { id: 'f3', policyId: 'CAGENT-010', severity: 'high', title: 'No request body size limit', scope: 'agent', location: 'pkg/proxy/middleware.go:15', status: 'open', description: 'No limit on request body size. Clients can send extremely large payloads causing memory pressure.', fix: 'Add a middleware that limits request body to a configurable max size (e.g., 1MB).', confidence: 88, tool_name: 'agent-lint', enriched: false },
      { id: 'f4', policyId: 'CTOOL-010', severity: 'medium', title: 'Missing request tracing', scope: 'tool', location: 'pkg/proxy/handler.go:12', status: 'open', description: 'No distributed tracing headers propagated. Debugging cross-service issues is difficult.', fix: 'Add OpenTelemetry tracing middleware. Propagate trace context to upstream calls.', confidence: 72, tool_name: 'semgrep', enriched: false },
      { id: 'f5', policyId: 'CAGENT-011', severity: 'medium', title: 'No fallback model configuration', scope: 'agent', location: 'pkg/router/selector.go:28', status: 'open', description: 'If the primary model is unavailable, requests fail. No fallback routing configured.', fix: 'Add a fallback model chain in router config. Route to next available model on failure.', confidence: 80, tool_name: 'agent-lint', enriched: false },
      { id: 'f6', policyId: 'CTOOL-011', severity: 'medium', title: 'Hardcoded rate limits', scope: 'tool', location: 'pkg/proxy/ratelimit.go:5', status: 'open', description: 'Rate limit thresholds are hardcoded constants. Cannot adjust without redeploying.', fix: 'Move rate limit config to environment variables or runtime-configurable store.', confidence: 75, tool_name: 'semgrep', enriched: false },
      { id: 'f7', policyId: 'CTOOL-012', severity: 'low', title: 'Verbose error messages in responses', scope: 'tool', location: 'pkg/proxy/handler.go:88', status: 'open', description: 'Internal error details leaked to clients in error responses, including stack traces.', fix: 'Return generic error messages to clients. Log details server-side.', confidence: 68, tool_name: 'semgrep', enriched: false },
      { id: 'f8', policyId: 'META-003', severity: 'medium', title: 'Opaque provider routing logic', scope: 'agent', location: 'pkg/router/selector.go:55', status: 'open', description: 'Provider routing uses opaque runtime expressions that cannot be statically evaluated. Routing decisions depend on live health checks and dynamic weights.', fix: '', confidence: 30, tool_name: 'meta-analyzer', enriched: false },
    ],
    surfaces: [
      { name: 'Proxy Handler', path: 'pkg/proxy/handler.go', type: 'tool', findings_count: 3, readiness: 60 },
      { name: 'Router', path: 'pkg/router/selector.go', type: 'agent', findings_count: 1, readiness: 75 },
      { name: 'Middleware', path: 'pkg/proxy/middleware.go', type: 'tool', findings_count: 1, readiness: 70 },
    ],
    activity: [
      { action: 'Scan completed — 7 findings detected', timestamp: '3 days ago', user: 'Alex M.', type: 'scan' },
      { action: 'Marked "Hardcoded rate limits" as fixed', timestamp: '2 days ago', user: 'Alex M.', type: 'fix' },
      { action: 'Repository added', timestamp: '5 days ago', user: 'Zane F.', type: 'add' },
    ],
  },

  'prompt-engine': {
    repo: { name: 'prompt-engine', framework: 'Express', language: 'TypeScript', readiness_score: 38, gate_status: 'fail', findings_count: 26, surfaces_count: 5 },
    scan: { id: 'scn_2a4e6c8d', tags: ['deterministic', 'reproducible', 'unsigned', 'offline'], readiness_fix_critical: 58, readiness_fix_all: 92 },
    findings: [
      { id: 'f1', policyId: 'CSKILL-005', severity: 'critical', title: 'Prompt injection via template variables', scope: 'skill', location: 'src/templates/render.ts:22', status: 'open', description: 'Template variables are interpolated without escaping. Attackers can inject arbitrary instructions into prompts.', fix: 'Escape all user-provided template variables. Use a sandboxed template engine.', confidence: 97, tool_name: 'prompt-guard', enriched: false },
      { id: 'f2', policyId: 'CTOOL-013', severity: 'critical', title: 'No access control on template CRUD', scope: 'tool', location: 'src/api/templates.ts:8', status: 'open', description: 'Template create/update/delete endpoints have no authentication or authorization checks.', fix: 'Add authentication middleware. Implement role-based access control for template management.', confidence: 95, tool_name: 'semgrep', enriched: false },
      { id: 'f3', policyId: 'CSKILL-006', severity: 'critical', title: 'Secrets in prompt templates', scope: 'skill', location: 'src/templates/system.ts:15', status: 'open', description: 'System prompts contain hardcoded API keys and internal URLs that get sent to LLM providers.', fix: 'Remove secrets from templates. Inject them server-side after template rendering.', confidence: 99, tool_name: 'secret-scanner', enriched: false },
      { id: 'f4', policyId: 'CSKILL-007', severity: 'high', title: 'No template versioning', scope: 'skill', location: 'src/templates/store.ts:30', status: 'open', description: 'Templates are overwritten in place. No history or rollback capability.', fix: 'Implement versioned template storage. Keep history and allow rollback.', confidence: 85, tool_name: 'prompt-guard', enriched: false },
      { id: 'f5', policyId: 'CAGENT-012', severity: 'high', title: 'Unbounded template rendering', scope: 'agent', location: 'src/engine/executor.ts:45', status: 'open', description: 'Recursive template includes have no depth limit. Can cause stack overflow.', fix: 'Add max recursion depth. Return error when limit exceeded.', confidence: 88, tool_name: 'agent-lint', enriched: false },
      { id: 'f6', policyId: 'CAGENT-013', severity: 'high', title: 'No output filtering', scope: 'agent', location: 'src/engine/executor.ts:78', status: 'open', description: 'LLM output is returned raw. No PII detection or content filtering.', fix: 'Add output filter pipeline. Check for PII patterns and blocked content.', confidence: 82, tool_name: 'agent-lint', enriched: false },
      { id: 'f7', policyId: 'CAGENT-014', severity: 'high', title: 'Missing error recovery in batch mode', scope: 'agent', location: 'src/engine/batch.ts:12', status: 'open', description: 'Batch processing stops on first error. Partial results are lost.', fix: 'Implement per-item error handling. Continue processing and report failures separately.', confidence: 84, tool_name: 'agent-lint', enriched: false },
      { id: 'f8', policyId: 'CTOOL-014', severity: 'high', title: 'No request deduplication', scope: 'tool', location: 'src/api/execute.ts:20', status: 'open', description: 'Identical requests are processed independently, wasting LLM tokens and time.', fix: 'Add request deduplication with TTL cache. Return cached result for duplicate requests.', confidence: 79, tool_name: 'semgrep', enriched: false },
      { id: 'f9', policyId: 'CSKILL-008', severity: 'medium', title: 'No template validation on save', scope: 'skill', location: 'src/templates/store.ts:15', status: 'open', description: 'Templates are saved without syntax validation. Malformed templates fail at runtime.', fix: 'Validate template syntax on save. Return clear errors for malformed templates.', confidence: 74, tool_name: 'prompt-guard', enriched: false },
      { id: 'f10', policyId: 'CTOOL-015', severity: 'medium', title: 'Missing OpenAPI documentation', scope: 'tool', location: 'src/api/index.ts:1', status: 'open', description: 'API has no OpenAPI/Swagger documentation. Integration is guesswork.', fix: 'Add OpenAPI annotations to all endpoints. Generate and serve documentation.', confidence: 60, tool_name: 'semgrep', enriched: false },
      { id: 'f11', policyId: 'CTOOL-016', severity: 'medium', title: 'No audit logging', scope: 'tool', location: 'src/api/templates.ts:25', status: 'open', description: 'Template changes are not logged. No audit trail for compliance.', fix: 'Log all template CRUD operations with user, timestamp, and diff.', confidence: 70, tool_name: 'semgrep', enriched: false },
      { id: 'f12', policyId: 'CTOOL-017', severity: 'medium', title: 'Synchronous file I/O', scope: 'tool', location: 'src/templates/store.ts:8', status: 'open', description: 'Template store uses synchronous file reads, blocking the event loop.', fix: 'Switch to async file I/O or use a database backend.', confidence: 72, tool_name: 'semgrep', enriched: false },
      { id: 'f13', policyId: 'CAGENT-015', severity: 'medium', title: 'No graceful degradation', scope: 'agent', location: 'src/engine/executor.ts:60', status: 'open', description: 'If LLM is unavailable, all requests fail. No fallback behavior.', fix: 'Add cached responses or static fallback for common queries when LLM is down.', confidence: 68, tool_name: 'agent-lint', enriched: false },
      { id: 'f14', policyId: 'CSKILL-009', severity: 'medium', title: 'Missing input sanitization', scope: 'skill', location: 'src/templates/render.ts:40', status: 'open', description: 'HTML/script tags in user input are not stripped before rendering.', fix: 'Sanitize all user input. Strip HTML tags and escape special characters.', confidence: 90, tool_name: 'prompt-guard', enriched: false },
      { id: 'f15', policyId: 'CTOOL-018', severity: 'medium', title: 'No connection pooling', scope: 'tool', location: 'src/db/client.ts:5', status: 'open', description: 'Creates new database connection per request. Causes connection exhaustion under load.', fix: 'Use connection pooling with configurable pool size.', confidence: 76, tool_name: 'semgrep', enriched: false },
      { id: 'f16', policyId: 'CTOOL-019', severity: 'low', title: 'Missing favicon', scope: 'tool', location: 'public/index.html:1', status: 'open', description: 'No favicon configured. Browser shows 404 errors in console.', fix: 'Add a favicon.ico to the public directory.', confidence: 40, tool_name: 'semgrep', enriched: false },
      { id: 'f17', policyId: 'CAGENT-016', severity: 'low', title: 'Unused imports in executor', scope: 'agent', location: 'src/engine/executor.ts:2', status: 'open', description: 'Multiple unused imports. Increases bundle size marginally.', fix: 'Remove unused imports.', confidence: 50, tool_name: 'agent-lint', enriched: false },
      { id: 'f18', policyId: 'CAGENT-017', severity: 'high', title: 'No token budget enforcement', scope: 'agent', location: 'src/engine/executor.ts:35', status: 'open', description: 'No per-request or per-user token budget. A single request can consume unlimited tokens.', fix: 'Add configurable token budgets per request and per user. Reject requests exceeding budget.', confidence: 91, tool_name: 'agent-lint', enriched: false },
      { id: 'f19', policyId: 'CTOOL-020', severity: 'critical', title: 'SQL injection in template search', scope: 'tool', location: 'src/db/queries.ts:18', status: 'open', description: 'Template search query uses string concatenation for SQL. Allows SQL injection.', fix: 'Use parameterized queries. Never concatenate user input into SQL strings.', confidence: 98, tool_name: 'semgrep', enriched: false },
      { id: 'f20', policyId: 'CTOOL-021', severity: 'critical', title: 'No HTTPS enforcement', scope: 'tool', location: 'src/server.ts:3', status: 'open', description: 'Server accepts HTTP connections. Data transmitted in plaintext.', fix: 'Enforce HTTPS. Redirect HTTP to HTTPS. Set HSTS headers.', confidence: 96, tool_name: 'semgrep', enriched: false },
      { id: 'f21', policyId: 'CTOOL-022', severity: 'high', title: 'Missing CSRF protection', scope: 'tool', location: 'src/api/index.ts:10', status: 'open', description: 'State-changing endpoints have no CSRF tokens. Vulnerable to cross-site request forgery.', fix: 'Add CSRF token middleware for all mutating endpoints.', confidence: 87, tool_name: 'semgrep', enriched: false },
      { id: 'f22', policyId: 'CTOOL-023', severity: 'medium', title: 'No request logging', scope: 'tool', location: 'src/api/index.ts:5', status: 'open', description: 'No access logging for API requests. Cannot audit or debug issues.', fix: 'Add request logging middleware with request ID, method, path, status, and duration.', confidence: 65, tool_name: 'semgrep', enriched: false },
      { id: 'f23', policyId: 'CTOOL-024', severity: 'low', title: 'README outdated', scope: 'tool', location: 'README.md:1', status: 'open', description: 'README references deprecated APIs and incorrect setup steps.', fix: 'Update README with current setup instructions and API reference.', confidence: 45, tool_name: 'semgrep', enriched: false },
      { id: 'f24', policyId: 'CAGENT-018', severity: 'medium', title: 'No memory limits on workers', scope: 'agent', location: 'src/engine/batch.ts:5', status: 'open', description: 'Worker processes have no memory limits. Can consume all available memory.', fix: 'Set per-worker memory limits. Restart workers that exceed threshold.', confidence: 73, tool_name: 'agent-lint', enriched: false },
      { id: 'f25', policyId: 'META-003', severity: 'low', title: 'Dynamic template resolution', scope: 'skill', location: 'src/templates/resolver.ts:10', status: 'open', description: 'Template resolution uses dynamic imports and opaque runtime conditions. Cannot evaluate statically which template is loaded at any given call site.', fix: '', confidence: 25, tool_name: 'meta-analyzer', enriched: false },
      { id: 'f26', policyId: 'META-005', severity: 'medium', title: 'Non-literal environment access', scope: 'tool', location: 'src/config/env.ts:3', status: 'open', description: 'Environment variables accessed via non-literal computed keys. Cannot evaluate which variables are read at build time.', fix: '', confidence: 20, tool_name: 'meta-analyzer', enriched: false },
    ],
    surfaces: [
      { name: 'Template Renderer', path: 'src/templates/render.md', type: 'skill', findings_count: 4, readiness: 30 },
      { name: 'Executor Engine', path: 'src/engine/executor.ts', type: 'agent', findings_count: 7, readiness: 25 },
      { name: 'API Layer', path: 'src/api/', type: 'tool', findings_count: 6, readiness: 35 },
      { name: 'Template Store', path: 'src/templates/store.ts', type: 'tool', findings_count: 4, readiness: 40 },
      { name: 'Batch Engine', path: 'src/engine/batch.ts', type: 'agent', findings_count: 3, readiness: 45 },
    ],
    activity: [
      { action: 'Scan completed — 24 findings detected', timestamp: '5 days ago', user: 'Zane F.', type: 'scan' },
      { action: 'Marked "Missing input sanitization" as fixed', timestamp: '4 days ago', user: 'Zane F.', type: 'fix' },
      { action: 'Ignored "No request logging"', timestamp: '4 days ago', user: 'Zane F.', type: 'ignore' },
      { action: 'Repository added', timestamp: '1 week ago', user: 'Zane F.', type: 'add' },
    ],
  },

  'eval-harness': {
    repo: { name: 'eval-harness', framework: 'Flask', language: 'Python', readiness_score: 89, gate_status: 'pass', findings_count: 3, surfaces_count: 2 },
    scan: { id: 'scn_5c3d7a9f', tags: ['deterministic', 'reproducible', 'offline'], readiness_fix_critical: 100, readiness_fix_all: 100 },
    findings: [
      { id: 'f1', policyId: 'CTOOL-025', severity: 'medium', title: 'Eval results stored without encryption', scope: 'tool', location: 'src/storage/results.py:22', status: 'open', description: 'Evaluation results including prompts and outputs are stored in plaintext on disk.', fix: 'Encrypt results at rest using AES-256. Store encryption key in secrets manager.', confidence: 72, tool_name: 'semgrep', enriched: false },
      { id: 'f2', policyId: 'CTOOL-026', severity: 'low', title: 'No pagination on results API', scope: 'tool', location: 'src/api/results.py:15', status: 'open', description: 'Results endpoint returns all results at once. Can cause timeouts on large datasets.', fix: 'Add cursor-based pagination with configurable page size.', confidence: 60, tool_name: 'semgrep', enriched: false },
      { id: 'f3', policyId: 'CAGENT-019', severity: 'medium', title: 'Missing test isolation', scope: 'agent', location: 'src/runner/executor.py:38', status: 'open', description: 'Eval runs share state. One test can affect another\'s results.', fix: 'Run each evaluation in an isolated context. Reset state between runs.', confidence: 78, tool_name: 'agent-lint', enriched: false },
    ],
    surfaces: [
      { name: 'Eval Runner', path: 'src/runner/executor.py', type: 'agent', findings_count: 1, readiness: 88 },
      { name: 'Results API', path: 'src/api/results.py', type: 'tool', findings_count: 2, readiness: 85 },
    ],
    activity: [
      { action: 'Scan completed — 3 findings detected', timestamp: '1 week ago', user: 'Alex M.', type: 'scan' },
      { action: 'Repository added', timestamp: '2 weeks ago', user: 'Zane F.', type: 'add' },
    ],
  },

  'rag-service': {
    repo: { name: 'rag-service', framework: 'LangChain', language: 'Python', readiness_score: 65, gate_status: 'fail', findings_count: 11, surfaces_count: 3 },
    scan: { id: 'scn_9e1b4f6c', tags: ['deterministic', 'reproducible', 'unsigned'], readiness_fix_critical: 78, readiness_fix_all: 94 },
    findings: [
      { id: 'f1', policyId: 'CAGENT-020', severity: 'critical', title: 'No document access control', scope: 'agent', location: 'src/retriever/search.py:25', status: 'open', description: 'All users can retrieve all documents. No tenant isolation or permission checks on retrieval.', fix: 'Add document-level ACLs. Filter retrieval results by user permissions.', confidence: 95, tool_name: 'agent-lint', enriched: false },
      { id: 'f2', policyId: 'CTOOL-027', severity: 'high', title: 'Embedding model not pinned', scope: 'tool', location: 'src/embeddings/config.py:8', status: 'open', description: 'Embedding model version is "latest". Model updates silently change embeddings, breaking existing indices.', fix: 'Pin embedding model to specific version. Add migration path for model updates.', confidence: 88, tool_name: 'semgrep', enriched: false },
      { id: 'f3', policyId: 'CSKILL-010', severity: 'high', title: 'No chunk overlap validation', scope: 'skill', location: 'src/chunker/splitter.py:18', status: 'open', description: 'Document chunks have no guaranteed overlap. Context can be lost at chunk boundaries.', fix: 'Add configurable chunk overlap. Validate that overlap preserves sentence boundaries.', confidence: 82, tool_name: 'prompt-guard', enriched: false },
      { id: 'f4', policyId: 'CTOOL-028', severity: 'high', title: 'Vector store has no backup', scope: 'tool', location: 'src/store/pinecone.py:5', status: 'open', description: 'Vector index has no backup strategy. Data loss on provider outage is permanent.', fix: 'Add periodic backup of vector indices. Test restore procedure.', confidence: 85, tool_name: 'semgrep', enriched: false },
      { id: 'f5', policyId: 'CAGENT-021', severity: 'medium', title: 'No relevance score threshold', scope: 'agent', location: 'src/retriever/search.py:40', status: 'open', description: 'All retrieved chunks are used regardless of similarity score. Low-relevance chunks dilute context.', fix: 'Add minimum relevance score threshold. Only include chunks above threshold.', confidence: 76, tool_name: 'agent-lint', enriched: false },
      { id: 'f6', policyId: 'CSKILL-011', severity: 'medium', title: 'Missing document deduplication', scope: 'skill', location: 'src/ingestion/loader.py:30', status: 'open', description: 'Same document can be ingested multiple times, creating duplicate chunks.', fix: 'Add content hash deduplication on ingestion. Skip already-indexed documents.', confidence: 74, tool_name: 'prompt-guard', enriched: false },
      { id: 'f7', policyId: 'CTOOL-029', severity: 'medium', title: 'No ingestion progress tracking', scope: 'tool', location: 'src/ingestion/loader.py:10', status: 'open', description: 'Batch ingestion has no progress reporting. Users cannot tell if ingestion is stuck.', fix: 'Add progress events. Report documents processed / total.', confidence: 68, tool_name: 'semgrep', enriched: false },
      { id: 'f8', policyId: 'CSKILL-012', severity: 'medium', title: 'Hardcoded chunk size', scope: 'skill', location: 'src/chunker/splitter.py:5', status: 'open', description: 'Chunk size is hardcoded to 512 tokens. Not optimal for all document types.', fix: 'Make chunk size configurable per document type or collection.', confidence: 70, tool_name: 'prompt-guard', enriched: false },
      { id: 'f9', policyId: 'CSKILL-013', severity: 'low', title: 'No metadata extraction', scope: 'skill', location: 'src/ingestion/loader.py:45', status: 'open', description: 'Document metadata (author, date, source) is not extracted during ingestion.', fix: 'Extract and store metadata alongside document chunks for filtering.', confidence: 58, tool_name: 'prompt-guard', enriched: false },
      { id: 'f10', policyId: 'CTOOL-030', severity: 'low', title: 'Missing collection statistics endpoint', scope: 'tool', location: 'src/api/collections.py:1', status: 'open', description: 'No API to check collection size, document count, or index health.', fix: 'Add /collections/:id/stats endpoint returning document count, chunk count, index size.', confidence: 55, tool_name: 'semgrep', enriched: false },
      { id: 'f11', policyId: 'META-003', severity: 'medium', title: 'Dynamic embedding model selection', scope: 'tool', location: 'src/embeddings/config.py:15', status: 'open', description: 'Embedding model is selected via opaque feature flag logic that cannot be statically resolved. Model choice depends on runtime A/B test assignment.', fix: '', confidence: 22, tool_name: 'meta-analyzer', enriched: false },
    ],
    surfaces: [
      { name: 'Retriever', path: 'src/retriever/search.py', type: 'agent', findings_count: 3, readiness: 55 },
      { name: 'Chunker', path: 'src/chunker/splitter.md', type: 'skill', findings_count: 3, readiness: 60 },
      { name: 'Ingestion', path: 'src/ingestion/loader.py', type: 'tool', findings_count: 3, readiness: 65 },
    ],
    activity: [
      { action: 'Scan completed — 10 findings detected', timestamp: '2 weeks ago', user: 'Zane F.', type: 'scan' },
      { action: 'Marked "No ingestion progress tracking" as fixed', timestamp: '1 week ago', user: 'Alex M.', type: 'fix' },
      { action: 'Ignored "Missing collection statistics"', timestamp: '1 week ago', user: 'Alex M.', type: 'ignore' },
      { action: 'Repository added', timestamp: '3 weeks ago', user: 'Zane F.', type: 'add' },
    ],
  },
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const FINDING_TEMPLATES: { title: string; policyId: string; severity: Finding['severity']; scope: Finding['scope']; description: string; fix: string; tool_name: string }[] = [
  { title: 'No error handling on LLM calls', policyId: 'CAGENT-050', severity: 'critical', scope: 'agent', description: 'LLM API calls have no error handling. Failures crash the process.', fix: 'Add try/catch with specific error type handling and fallback behavior.', tool_name: 'agent-lint' },
  { title: 'Missing input validation', policyId: 'CSKILL-050', severity: 'high', scope: 'skill', description: 'User input accepted without validation. Can cause unexpected behavior.', fix: 'Add input schema validation before processing.', tool_name: 'prompt-guard' },
  { title: 'No retry mechanism', policyId: 'CTOOL-050', severity: 'high', scope: 'tool', description: 'External API calls have no retry logic. Transient failures cause permanent errors.', fix: 'Add exponential backoff retry with configurable max attempts.', tool_name: 'semgrep' },
  { title: 'Hardcoded configuration', policyId: 'CTOOL-051', severity: 'medium', scope: 'tool', description: 'Configuration values are hardcoded. Changes require redeployment.', fix: 'Move to environment variables or config file.', tool_name: 'semgrep' },
  { title: 'Missing structured logging', policyId: 'CAGENT-051', severity: 'medium', scope: 'agent', description: 'Uses console.log. No structured logging for observability.', fix: 'Replace with structured logger with correlation IDs.', tool_name: 'agent-lint' },
  { title: 'No rate limiting', policyId: 'CSKILL-051', severity: 'high', scope: 'skill', description: 'Endpoints have no rate limiting. Vulnerable to abuse.', fix: 'Add per-user rate limiting middleware.', tool_name: 'prompt-guard' },
  { title: 'Unused dependencies', policyId: 'CTOOL-052', severity: 'low', scope: 'tool', description: 'Package dependencies that are not imported anywhere in code.', fix: 'Remove unused dependencies from package manifest.', tool_name: 'semgrep' },
  { title: 'No health check endpoint', policyId: 'CTOOL-053', severity: 'medium', scope: 'tool', description: 'No /health endpoint for monitoring and load balancing.', fix: 'Add health check endpoint with dependency status.', tool_name: 'semgrep' },
]

export function generateMockEnrichment(finding: Finding): Pick<Finding, 'ai_explanation' | 'ai_fix' | 'code_snippet' | 'replacement'> {
  const fileName = finding.location.split(':')[0]
  const lineNum = finding.location.split(':')[1] || '1'
  const impactMap: Record<string, string> = {
    critical: 'Can cause system crashes, data loss, or security breaches in production',
    high: 'Degrades reliability, enables abuse, or violates security best practices',
    medium: 'Affects maintainability, observability, or development velocity',
    low: 'Minor issue with minimal production impact',
  }

  return {
    ai_explanation: `Analysis of ${finding.policyId} in ${fileName} at line ${lineNum}:\n\n${finding.description}\n\nThis is a ${finding.severity}-severity issue in the ${finding.scope} layer. ${impactMap[finding.severity]}. The pattern was identified by ${finding.tool_name} with ${finding.confidence}% confidence. ${finding.fix}`,
    ai_fix: `Apply the following change to ${fileName} starting at line ${lineNum}: ${finding.fix}`,
    code_snippet: `// ${fileName}:${lineNum}\n// Current implementation\nfunction handle() {\n  // ${finding.title.toLowerCase()}\n  return process(input)\n}`,
    replacement: `// ${fileName}:${lineNum}\n// Fixed implementation\nfunction handle() {\n  const validated = validate(input)\n  try {\n    return process(validated)\n  } catch (err) {\n    logger.error('${finding.policyId}', { err })\n    return fallback(err)\n  }\n}`,
  }
}

const SEVERITY_ORDER: Finding['severity'][] = ['low', 'medium', 'high', 'critical']

function bumpSeverity(s: Finding['severity']): Finding['severity'] {
  const i = SEVERITY_ORDER.indexOf(s)
  return Math.random() < 0.5 ? SEVERITY_ORDER[Math.max(0, i - 1)] : SEVERITY_ORDER[Math.min(SEVERITY_ORDER.length - 1, i + 1)]
}

// Simulates what a fresh scan would find: a few findings get fixed, a few
// change severity, a couple new ones appear — the rest are unchanged. Since
// this is a mock backend, we generate the "after" state and the diff against
// the "before" state together instead of running two independent scans and
// diffing them.
export function generateRescanResult(current: Finding[], previousScanAt: string): { findings: Finding[]; comparison: ScanComparison } {
  const open = current.filter(f => f.status === 'open')
  const shuffled = [...open].sort(() => Math.random() - 0.5)

  const fixedCount = open.length >= 3 ? Math.min(2, Math.floor(open.length * 0.15) + 1) : 0
  const fixed = shuffled.slice(0, fixedCount)

  const changedCount = open.length - fixedCount >= 3 ? Math.min(2, Math.floor(open.length * 0.15) + 1) : 0
  const changedSource = shuffled.slice(fixedCount, fixedCount + changedCount)
  const changed = changedSource.map(f => ({ finding: f, previous_severity: f.severity, current_severity: bumpSeverity(f.severity) }))

  const unchangedSource = shuffled.slice(fixedCount + changedCount)

  const existingPolicyIds = new Set(current.map(f => f.policyId))
  const candidates = FINDING_TEMPLATES.filter(t => !existingPolicyIds.has(t.policyId))
  const newCount = Math.min(candidates.length, 1 + Math.floor(Math.random() * 2))
  const newFindings: Finding[] = candidates.slice(0, newCount).map((template, i) => ({
    id: `new-${Date.now()}-${i}`,
    policyId: template.policyId,
    severity: template.severity,
    title: template.title,
    scope: template.scope,
    location: `src/${template.scope}s/main.ts:${10 + i * 8}`,
    status: 'open' as const,
    description: template.description,
    fix: template.fix,
    confidence: 70 + i * 5,
    tool_name: template.tool_name,
    enriched: false,
  }))

  const notOpen = current.filter(f => f.status !== 'open')
  const findings: Finding[] = [
    ...notOpen,
    ...unchangedSource,
    ...changed.map(c => ({ ...c.finding, severity: c.current_severity })),
    ...newFindings,
  ]

  const comparison: ScanComparison = {
    previous_scan_at: previousScanAt,
    new_findings: newFindings.map(f => f.id),
    fixed_findings: fixed,
    changed_findings: changed.map(c => ({ finding_id: c.finding.id, previous_severity: c.previous_severity, current_severity: c.current_severity })),
    unchanged_findings: unchangedSource.map(f => f.id),
  }

  return { findings, comparison }
}

export function getRepoDetail(name: string): RepoDetail {
  if (MOCK_DETAILS[name]) return MOCK_DETAILS[name]

  const h = hashCode(name)
  const findingsCount = 2 + (h % 15)
  const readiness = 30 + (h % 60)
  const gateStatus: 'pass' | 'fail' = readiness >= 80 ? 'pass' : 'fail'

  const findings: Finding[] = Array.from({ length: findingsCount }, (_, i) => {
    const template = FINDING_TEMPLATES[(h + i) % FINDING_TEMPLATES.length]
    return {
      id: `f${i + 1}`,
      policyId: template.policyId,
      severity: template.severity,
      title: template.title,
      scope: template.scope,
      location: `src/${template.scope}s/main:${10 + ((h + i * 7) % 90)}`,
      status: 'open' as const,
      description: template.description,
      fix: template.fix,
      confidence: 60 + ((h + i) % 35),
      tool_name: template.tool_name,
      enriched: false,
    }
  })

  const surfaceCount = 1 + (h % 4)
  const surfaces: Surface[] = Array.from({ length: surfaceCount }, (_, i) => {
    const types: Surface['type'][] = ['agent', 'skill', 'tool']
    const type = types[(h + i) % 3]
    const ext = type === 'skill' ? '.md' : '.ts'
    return {
      name: `Surface ${i + 1}`,
      path: `src/surface-${i + 1}${ext}`,
      type,
      findings_count: Math.ceil(findingsCount / surfaceCount),
      readiness: readiness - 5 + ((h + i) % 10),
    }
  })

  return {
    repo: { name, framework: 'Unknown', language: 'Unknown', readiness_score: readiness, gate_status: gateStatus, findings_count: findingsCount, surfaces_count: surfaceCount },
    scan: { id: `scn_${name.slice(0, 8)}`, tags: ['deterministic', 'reproducible'], readiness_fix_critical: Math.min(100, readiness + 20), readiness_fix_all: Math.min(100, readiness + 30) },
    findings,
    surfaces,
    activity: [
      { action: `Scan completed — ${findingsCount} findings detected`, timestamp: 'Just now', user: 'Zane F.', type: 'scan' },
      { action: 'Repository added', timestamp: 'Just now', user: 'Zane F.', type: 'add' },
    ],
  }
}
