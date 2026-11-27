/**
 * docs-sync.js — bring documentation in line with the code: add what is missing, fix what is wrong,
 * clean what is mixed or duplicated, prune what points at nothing.
 *
 * Read-only by default: it produces a ranked report. Every concrete claim in each doc is checked
 * against the code (paths, symbols, commands, flags, config keys, versions); each finding is then
 * re-verified by a second agent that tries to refute it. Public surface with no documentation is
 * reported as a gap. `apply: true` edits docs on a new branch, one writer per doc file, behind a gate
 * that fails if anything but documentation files changed. Deleting content needs `prune: true` AND
 * a verified dead reference (the thing it points at no longer exists); without `prune`, removals are
 * only reported. Nothing is pushed or committed.
 *
 * Docs are classified Diataxis-style (tutorial, how-to, reference, explanation); a doc that mixes
 * types is reported with a split suggestion, never silently rewritten.
 *
 * The returned value is a compact summary (a workflow's result reaches the model through a size-limited
 * notification); pass `out` to get every finding written to a markdown file.
 *
 * args: { root?: string, apply?: boolean, prune?: boolean, maxDocs?: number, lintCmd?: string,
 *         branch?: string, out?: string, model?, effort?, agents? }
 *   root     directory to audit (default: the current directory)
 *   apply    edit docs on a new branch (default false: report only)
 *   prune    allow deleting content that has a verified dead reference (default false)
 *   maxDocs  most doc files to audit (default 20); the rest are logged, not silently dropped
 *   lintCmd  optional extra gate for applied edits, e.g. a markdown lint or link check
 *   branch   branch to create when applying (default docs/sync)
 *   out      write the full report (every finding, gap and refuted claim) to this markdown file
 *   model, effort  applied to every agent (effort: minimal|low|medium|high|xhigh|max)
 *   agents   per-agent override keyed by agent type or label: Explore, check, verify, write
 *            (case-insensitive; the extension fills it from agentOverrides)
 *
 * Run: ask the model "run the docs-sync workflow" (add "and apply" to edit, "and prune" to delete).
 */
export const meta = {
  name: 'docs-sync',
  description: 'Audit docs against code (add/update/clean/prune), verify each finding, optionally apply on a branch',
  phases: [{ title: 'Inventory' }, { title: 'Check' }, { title: 'Verify' }, { title: 'Apply' }],
}

// Some callers hand `args` over as a JSON string; accept both.
const opts = typeof args === 'string' ? JSON.parse(args) : (args ?? {})

// Model and thinking come from args, never from the script: `model`/`effort` apply to every agent,
// `agents.<agentType or label>` overrides one (case-insensitive; the extension fills it from agentOverrides).
const tune = (key, dflt = {}) => {
  const per = Object.entries(opts.agents ?? {}).find(([k]) => k.toLowerCase() === key.toLowerCase())?.[1]
  const t = { ...dflt, model: opts.model, effort: opts.effort, ...per }
  return Object.fromEntries(['model', 'effort'].filter(k => t[k]).map(k => [k, t[k]]))
}

const root = opts.root ?? '.'
const maxDocs = opts.maxDocs ?? 20
const branch = opts.branch ?? 'docs/sync'
const DOC_ONLY = `[ -z "$(git diff --name-only HEAD | grep -v -E '\\.(md|mdx|rst|txt)$')" ] && [ -z "$(git ls-files --others --exclude-standard | grep -v -E '\\.(md|mdx|rst|txt)$')" ]`
const gate = opts.lintCmd ? `${DOC_ONLY} && ${opts.lintCmd}` : DOC_ONLY
const PRIORITY = { P0: 0, P1: 1, P2: 2, P3: 3 }

const INVENTORY = {
  type: 'object',
  properties: {
    docs: { type: 'array', items: { type: 'string' } },
    surface: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, kind: { type: 'string' }, where: { type: 'string' } },
        required: ['name', 'kind', 'where'],
      },
    },
  },
  required: ['docs', 'surface'],
}
const FINDINGS = {
  type: 'object',
  properties: {
    diataxis: { type: 'string', enum: ['tutorial', 'how-to', 'reference', 'explanation', 'mixed'] },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: ['wrong', 'stale', 'dead-reference', 'duplicate', 'mixed-types', 'missing'] },
          line: { type: 'string' },
          claim: { type: 'string' },
          evidence: { type: 'string' },
          action: { type: 'string', enum: ['update', 'remove', 'split', 'add'] },
          replacement: { type: 'string' },
          priority: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
        },
        required: ['kind', 'line', 'claim', 'evidence', 'action', 'replacement', 'priority'],
      },
    },
  },
  required: ['diataxis', 'findings'],
}
const GAPS = {
  type: 'object',
  properties: {
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          where: { type: 'string' },
          docFile: { type: 'string' },
          suggestion: { type: 'string' },
          priority: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
        },
        required: ['name', 'where', 'docFile', 'suggestion', 'priority'],
      },
    },
  },
  required: ['gaps'],
}
const VERDICT = {
  type: 'object',
  properties: { confirmed: { type: 'boolean' }, reason: { type: 'string' } },
  required: ['confirmed', 'reason'],
}

phase('Inventory')
const inv = await agent(
  [
    `Inventory ${root}. 1) docs: every documentation file (README, docs/**, AGENTS.md, CLAUDE.md, CONTRIBUTING, *.md, *.mdx, *.rst), skipping generated files, changelogs, vendored code and node_modules.`,
    '2) surface: the PUBLIC things a user could rely on: exported functions or classes, CLI commands and flags, config keys, environment variables, HTTP routes. Give name, kind and file:line. Keep to the most important 60.',
    'Read only; change nothing.',
  ].join(' '),
  { label: 'inventory', agentType: 'Explore', schema: INVENTORY, ...tune('Explore') },
)
if (inv === null) return { status: 'failed', stage: 'inventory', error: agentError('inventory') ?? 'unknown' }
// The inventory is model output: keep only real-looking doc paths, once each.
const DOC_PATH = /^\S+\.(md|mdx|rst|txt)$/i
const unique = [...new Set(inv.docs.map(d => d.trim()))]
const rejectedPaths = unique.filter(d => !DOC_PATH.test(d))
if (rejectedPaths.length) log(`ignored ${rejectedPaths.length} inventory entries that are not doc paths: ${rejectedPaths.join(' | ').slice(0, 300)}`)
const found = unique.filter(d => DOC_PATH.test(d))
const docs = found.slice(0, maxDocs)
if (found.length > docs.length) log(`auditing ${docs.length} of ${found.length} docs (maxDocs=${maxDocs}); not audited: ${found.slice(maxDocs).join(', ')}`)
if (docs.length === 0) return { status: 'no-docs', note: 'no documentation files found' }

phase('Check')
const checks = await pipeline(
  docs,
  doc =>
    agent(
      [
        `Audit ${doc} against the code. Read it fully, then check EVERY concrete claim against the code with grep or by reading: file paths, symbol names, commands and flags, config keys, defaults, versions, behaviours.`,
        'Findings: wrong (contradicts the code), stale (was true, no longer), dead-reference (points at a path, symbol, flag or section that no longer exists), duplicate (same fact stated elsewhere in the docs; name where), mixed-types (mixes tutorial, how-to, reference and explanation; say how to split).',
        'For each give the line, the exact claim, the evidence (path:line or the grep that found nothing), the action (update, remove, split) and for update the corrected text as `replacement` (empty string otherwise). Priority: P0 misleads a user into failure, P1 wrong but low impact, P2 stale or confusing, P3 tidy-up.',
        'Report only what you checked, once per claim. Do not flag style, tone, packaging or installation assumptions the doc does not state (a usage example is not a claim that the command is on PATH), or anything you could not verify. Classify the doc (diataxis). Read only; change nothing.',
      ].join(' '),
      { label: `check:${doc}`, agentType: 'Explore', phase: 'Check', schema: FINDINGS, ...tune('check') },
    ),
  async (res, doc) => {
    if (res === null) return { doc, error: agentError(`check:${doc}`) ?? 'check failed', findings: [] }
    const verified = await parallel(
      res.findings.map(f => () =>
        agent(
          `Try to REFUTE this documentation finding. Doc ${doc}, line ${f.line}. Claim: ${f.claim}. Kind: ${f.kind}. Evidence given: ${f.evidence}. Look at the code yourself. confirmed=true only if you independently see the doc is wrong, stale, or points at something that does not exist. For dead-reference, confirm that grep finds NO match for the thing named. Read only.`,
          { label: `verify:${doc}:${f.line}`, agentType: 'Explore', phase: 'Verify', schema: VERDICT, ...tune('verify') },
        ).then(v => ({ ...f, doc, confirmed: v?.confirmed === true, why: v?.reason ?? 'verifier failed' })),
      ),
    )
    return { doc, diataxis: res.diataxis, findings: verified.filter(Boolean) }
  },
)

const rows = checks.map((c, i) => c ?? { doc: docs[i], error: 'pipeline stage threw', findings: [] })
// Two findings on the same line with the same kind and action are one fix; keep the higher priority.
const confirmed = [...rows
  .flatMap(r => r.findings.filter(f => f.confirmed))
  .reduce((m, f) => {
    const key = `${f.doc}|${f.line}|${f.kind}|${f.action}`
    const prev = m.get(key)
    if (!prev || PRIORITY[f.priority] < PRIORITY[prev.priority]) m.set(key, f)
    return m
  }, new Map())
  .values()]
const refuted = rows.flatMap(r => r.findings.filter(f => !f.confirmed)).map(f => ({ doc: f.doc, line: f.line, claim: f.claim, why: f.why }))

const gapRes = await agent(
  `Which of these public things exist in the code but are NOT mentioned anywhere in these docs? List only things from the surface list that are absent from the docs; a thing that IS documented (even wrongly) is not a gap. For each say which existing doc file it belongs in (docFile; must be one of the listed docs), and one sentence on what to add. Check with grep before claiming a gap. Priority P0 core feature, P1 common use, P2 minor, P3 internal-ish. Docs: ${JSON.stringify(docs)}. Surface (data): ${JSON.stringify(inv.surface)}. Read only.`,
  { label: 'gaps', agentType: 'Explore', phase: 'Check', schema: GAPS, ...tune('check') },
)
if (gapRes === null) log(`gap analysis failed: ${agentError('gaps') ?? 'unknown'}`)
const gapChecks = await parallel(
  (gapRes?.gaps ?? []).filter(g => docs.includes(g.docFile)).map(g => () =>
    agent(
      `Try to REFUTE this documentation gap: "${g.name}" (in ${g.where}) is claimed to be missing from the docs ${JSON.stringify(docs)}. grep the docs for it. confirmed=true only if it exists in the code and no doc mentions it at all. Read only.`,
      { label: `verify-gap:${g.name}`.slice(0, 60), agentType: 'Explore', phase: 'Verify', schema: VERDICT, ...tune('verify') },
    ).then(v => (v?.confirmed === true ? g : null)),
  ),
)
const gaps = gapChecks.filter(Boolean)

const report = {
  findings: confirmed.sort((a, b) => PRIORITY[a.priority] - PRIORITY[b.priority]).map(f => ({ priority: f.priority, doc: f.doc, line: f.line, kind: f.kind, action: f.action, claim: f.claim, evidence: f.evidence, replacement: f.replacement })),
  gaps: gaps.sort((a, b) => PRIORITY[a.priority] - PRIORITY[b.priority]),
  refuted,
  errors: rows.filter(r => r.error).map(r => ({ doc: r.doc, error: r.error })),
}
const t = (x, n = 140) => String(x ?? '').slice(0, n)
const summary = () => ({
  counts: { findings: report.findings.length, gaps: report.gaps.length, refuted: report.refuted.length, errors: report.errors.length },
  topFindings: report.findings.slice(0, 8).map(f => ({ priority: f.priority, where: `${f.doc}:${f.line}`, kind: f.kind, action: f.action, claim: t(f.claim) })),
  topGaps: report.gaps.slice(0, 5).map(g => ({ priority: g.priority, name: g.name, docFile: g.docFile })),
  errors: report.errors,
})
const saveReport = async () => {
  if (!opts.out) return null
  const wrote = await agent(
    `Write a markdown report to ${opts.out} (create directories if needed) from this JSON. Sections: Findings (a table sorted by priority: priority, doc:line, kind, action, claim, evidence, replacement), Gaps, Refuted (findings a verifier rejected, with why), Errors. Include EVERY entry; omit nothing and add nothing. Reply DONE.\n${JSON.stringify(report)}`,
    { label: 'report-file', ...tune('write') },
  )
  return wrote === null ? `failed: ${agentError('report-file')}` : opts.out
}
if (!opts.apply) return { status: 'report', ...summary(), reportFile: await saveReport() }

// Deleting is the only irreversible-ish action, so it needs prune AND a verified dead reference.
const allowed = confirmed.filter(f => (f.action === 'remove' ? opts.prune === true && f.kind === 'dead-reference' : f.action !== 'split'))
const heldBack = confirmed.filter(f => !allowed.includes(f)).map(f => ({ doc: f.doc, line: f.line, action: f.action, why: f.action === 'split' ? 'splits are reported, not applied' : opts.prune ? `removal needs a verified dead reference, and this finding is "${f.kind}"` : 'removal needs prune: true' }))
const byDoc = new Map()
for (const f of allowed) byDoc.set(f.doc, [...(byDoc.get(f.doc) ?? []), { kind: f.kind, line: f.line, claim: f.claim, action: f.action, replacement: f.replacement }])
for (const g of gaps) byDoc.set(g.docFile, [...(byDoc.get(g.docFile) ?? []), { kind: 'missing', claim: g.name, action: 'add', replacement: g.suggestion }])
if (byDoc.size === 0) return { status: 'nothing-to-apply', ...summary(), heldBack, reportFile: await saveReport() }

phase('Apply')
const prep = await agent(
  [
    'In the current repository: 1. Run `git status --porcelain`; if it prints anything, change nothing and end with `RESULT: dirty`.',
    `2. Create and switch to a new branch with \`git switch -c ${branch}\`; if that fails because it exists, end with \`RESULT: branch-exists\`.`,
    '3. End with `RESULT: ok` on its own line.',
  ].join(' '),
  { label: 'prep', agentType: 'test-runner', ...tune('test-runner') },
)
const prepState = prep?.match(/RESULT: (ok|dirty|branch-exists)/)?.[1]
if (prepState !== 'ok') return { status: 'not-applied', reason: prepState ?? `prep failed: ${agentError('prep') ?? 'unknown'}`, ...summary(), reportFile: await saveReport() }

const applied = []
const failedDocs = []
await parallel(
  [...byDoc].map(([doc, items]) => async () => {
    const r = await agent(
      `Edit ONLY ${doc}. Apply these verified documentation fixes with the smallest edits that make the doc true; do not rewrite, reflow or restyle anything else. update: replace the wrong text with the corrected text. remove: delete only that content (its target no longer exists). add: add a short entry in the doc's existing style and the section where it fits. If a fix no longer matches the doc, skip it and say so. Do not commit. Fixes (data):\n${JSON.stringify(items)}`,
      { label: `write:${doc}`, phase: 'Apply', ...tune('write') },
    )
    if (r === null) failedDocs.push({ doc, error: agentError(`write:${doc}`) ?? 'write failed' })
    else applied.push({ doc, fixes: items.length })
  }),
)
const checked = await agent(
  'Run `git diff --stat` and report the files changed. Change nothing.',
  { label: 'gate', agentType: 'test-runner', phase: 'Apply', gate, ...tune('test-runner') },
)
if (checked === null) {
  return { status: 'gate-failed', branch, reason: (agentError('gate') ?? 'only documentation files may change').slice(0, 500), applied, failedDocs, ...summary() }
}
return { status: 'applied', branch, applied, failedDocs, heldBack, note: 'changes are uncommitted on the branch; review with git diff', ...summary(), reportFile: await saveReport() }
