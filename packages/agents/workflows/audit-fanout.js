/**
 * audit-fanout.js — audit every file under a path, then try to refute each finding.
 *
 * The file list only exists once something has looked, so a discovery agent produces it and a
 * pipeline pushes each file through audit then verify with no barrier between the stages. Only
 * findings that survive refutation are returned.
 *
 * args: { root?: string, focus?: string, max?: number }
 *   root   directory to audit (default: src/)
 *   focus  what to look for (default: security problems)
 *   max    most files to audit (default: 30); anything beyond it is logged, not silently skipped
 *   model, effort  applied to every agent (effort: minimal|low|medium|high|xhigh|max)
 *   agents         per-agent override keyed by agent type or label, e.g.
 *                  {"reviewer": {"model": "provider/id", "effort": "high"}}
 *
 * Run: ask the model "run the audit-fanout workflow on src/api looking for missing authz checks".
 */
export const meta = {
  name: 'audit-fanout',
  description: 'Audit each file under a path for a given concern and keep only findings that survive refutation',
  phases: [{ title: 'Discover' }, { title: 'Audit' }, { title: 'Verify' }],
}

// Some callers hand `args` over as a JSON string; accept both.
const opts = typeof args === 'string' ? JSON.parse(args) : (args ?? {})

// Model and thinking come from args, never from the script: `model`/`effort` apply to every agent,
// `agents.<agentType or label>` overrides one (case-insensitive; the extension fills it from agentOverrides). Unset means inherit (agent file, then the session).
const tune = (key, dflt = {}) => {
  const per = Object.entries(opts.agents ?? {}).find(([k]) => k.toLowerCase() === key.toLowerCase())?.[1]
  const t = { ...dflt, model: opts.model, effort: opts.effort, ...per }
  return Object.fromEntries(['model', 'effort'].filter(k => t[k]).map(k => [k, t[k]]))
}

const root = opts.root ?? 'src/'
const focus = opts.focus ?? 'security problems'
const max = opts.max ?? 30

const FILES = {
  type: 'object',
  properties: { files: { type: 'array', items: { type: 'string' } } },
  required: ['files'],
}
const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          line: { type: 'integer' },
          issue: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: ['issue', 'severity'],
      },
    },
  },
  required: ['findings'],
}
const VERDICT = {
  type: 'object',
  properties: { holds: { type: 'boolean' }, why: { type: 'string' } },
  required: ['holds'],
}

phase('Discover')
const listing = await agent(
  `List the source files under ${root} worth auditing for ${focus}. Skip generated files, lockfiles and vendored code. Return paths only.`,
  { label: 'discover', agentType: 'Explore', phase: 'Discover', schema: FILES, ...tune('Explore') },
)
if (listing === null) return { audited: 0, findings: [], error: agentError('discover') ?? 'discovery failed' }

const files = listing.files.slice(0, max)
if (listing.files.length > files.length) {
  log(`auditing ${files.length} of ${listing.files.length} files; the rest were dropped by max=${max}`)
}

const results = await pipeline(
  files,
  file =>
    agent(`Audit ${file} for ${focus}. Return findings, or an empty list.`, {
      label: `audit:${file}`,
      agentType: 'security-auditor',
      phase: 'Audit',
      schema: FINDINGS,
      ...tune('security-auditor'),
    }),
  async (audit, file) => {
    if (audit.findings.length === 0) return { file, findings: [] }
    const checked = await parallel(
      audit.findings.map((f, i) => () =>
        agent(
          `Try to REFUTE this finding in ${file}${f.line ? ` near line ${f.line}` : ''}: ${f.issue}. Read the code. Default to holds=false if you cannot confirm it.`,
          { label: `verify:${file}:${i}`, agentType: 'security-auditor', phase: 'Verify', schema: VERDICT, ...tune('verify') },
        ),
      ),
    )
    return { file, findings: audit.findings.filter((_, i) => checked[i]?.holds) }
  },
)

const kept = results.filter(Boolean).flatMap(r => r.findings.map(f => ({ file: r.file, ...f })))
return { audited: results.filter(Boolean).length, failed: results.filter(r => r === null).length, findings: kept }
