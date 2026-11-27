/**
 * refactor-simplify.js — remove code and indirection without changing behaviour, one atomic step at a time.
 *
 * A scan finds candidates that REMOVE something (dead code, single-use abstractions, duplication,
 * needless parameters, pass-through layers). Steps run serially on a new branch. For each step:
 * behaviour the step could touch is first pinned with characterization tests if no test covers it;
 * then one change is made behind a gate that requires the whole suite to pass, no test file edited,
 * no new files, and no more lines added than removed. A step that fails the gate twice is reverted.
 * A final review looks for behaviour changes and abstractions that crept in.
 *
 * Works in the current checkout; the tree must be clean. Nothing is pushed.
 *
 * args: { target: string, checkCmd: string, goal?: string, maxSteps?: number, maxFiles?: number,
 *         maxNetLines?: number, branch?: string, model?, effort?, agents? }
 *   target       paths or a directory to simplify
 *   checkCmd     command that runs the whole suite and must pass after every step
 *   goal         what "simpler" means here (default: fewer lines and fewer layers, same behaviour)
 *   maxSteps     most steps to apply (default 8); the rest are logged, not silently dropped
 *   maxFiles     most files to scan (default 15); the rest are logged
 *   maxNetLines  largest allowed (added - removed) per step (default 0: a step may not grow the code)
 *   branch       branch to create (default refactor/simplify)
 *   model, effort  applied to every agent (effort: minimal|low|medium|high|xhigh|max)
 *   agents       per-agent override keyed by agent type or label: Explore, test-writer, test-runner,
 *                refactor, reviewer (case-insensitive; the extension fills it from agentOverrides)
 *
 * Run: ask the model "run the refactor-simplify workflow on src/billing with checkCmd 'pnpm test'".
 */
export const meta = {
  name: 'refactor-simplify',
  description: 'Simplify code in atomic, gated steps with behaviour pinned by tests, then review',
  phases: [{ title: 'Scan' }, { title: 'Steps' }, { title: 'Review' }],
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

const { target, checkCmd } = opts
if (!target || !checkCmd) return { error: 'args.target and args.checkCmd are required' }
const goal = opts.goal ?? 'fewer lines and fewer layers, with identical behaviour'
const maxSteps = opts.maxSteps ?? 8
const maxFiles = opts.maxFiles ?? 15
const maxNet = opts.maxNetLines ?? 0
const branch = opts.branch ?? 'refactor/simplify'
const TEST_PATHS = [
  '**/test/**', '**/tests/**', '**/__tests__/**', '**/*.test.*', '**/*.spec.*', '**/*_test.*', '**/test_*',
].map(p => `':(glob)${p}'`).join(' ')

const FILES = { type: 'object', properties: { files: { type: 'array', items: { type: 'string' } } }, required: ['files'] }
const CANDIDATES = {
  type: 'object',
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: ['dead-code', 'single-use-abstraction', 'duplication', 'needless-parameter', 'pass-through-layer', 'other'] },
          where: { type: 'string' },
          change: { type: 'string' },
          linesRemoved: { type: 'integer' },
          risk: { type: 'string', enum: ['low', 'medium', 'high'] },
          pinned: { type: 'boolean' },
        },
        required: ['kind', 'where', 'change', 'linesRemoved', 'risk', 'pinned'],
      },
    },
  },
  required: ['candidates'],
}
const VERDICT = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    behaviourChanges: { type: 'array', items: { type: 'string' } },
    addedAbstractions: { type: 'array', items: { type: 'string' } },
    netLines: { type: 'integer' },
  },
  required: ['ok', 'behaviourChanges', 'addedAbstractions', 'netLines'],
}

phase('Scan')
const listing = await agent(
  `List the source files under ${target} that could be simplified. Skip tests, generated files, lockfiles and vendored code. Return paths only. Read only.`,
  { label: 'files', agentType: 'Explore', schema: FILES, ...tune('Explore') },
)
if (listing === null) return { status: 'failed', stage: 'files', error: agentError('files') ?? 'unknown' }
const files = listing.files.slice(0, maxFiles)
if (listing.files.length > files.length) log(`scanning ${files.length} of ${listing.files.length} files (maxFiles=${maxFiles}); not scanned: ${listing.files.slice(maxFiles).join(', ')}`)
if (files.length === 0) return { status: 'nothing-to-simplify', note: 'no source files found' }

const scans = await pipeline(files, file =>
  agent(
    [
      `Find simplifications in ${file}. Goal: ${goal}. List at most 3, each one a SINGLE atomic change that REMOVES code or indirection:`,
      'dead code, a single-use abstraction, duplication, a parameter or option nothing varies, a pass-through layer.',
      'Do NOT propose adding a helper, type, interface, layer, option or file; renames and reordering; or style changes.',
      'If the code is exported, search the whole repository for importers and callers first. Propose removing an export only when none exist and it is not part of a published public API; otherwise mark the candidate risk "high".',
      '`pinned` is true only if an existing test would fail if this change altered behaviour. `linesRemoved` is your estimate of net lines removed.',
      'Behaviour must stay identical: same outputs, errors, side effects and ordering. Read only; change nothing.',
    ].join(' '),
    { label: `scan:${file}`, agentType: 'Explore', phase: 'Scan', schema: CANDIDATES, ...tune('Explore') },
  ),
)
const all = scans.flatMap((s, i) => (s ? s.candidates.map((c, j) => ({ ...c, id: `${files[i]}#${j + 1}`, file: files[i] })) : []))
const worth = all.filter(c => c.risk !== 'high' && c.linesRemoved > 0)
if (all.length > worth.length) log(`${all.length - worth.length} candidate(s) skipped: high risk or nothing removed`)
worth.sort((a, b) => b.linesRemoved - a.linesRemoved)
const steps = worth.slice(0, maxSteps)
if (worth.length > steps.length) log(`applying ${steps.length} of ${worth.length} candidates (maxSteps=${maxSteps})`)
if (steps.length === 0) return { status: 'nothing-to-simplify', scanned: files.length }

const prep = await agent(
  [
    'In the current repository: 1. Run `git status --porcelain`; if it prints anything, change nothing and end with `RESULT: dirty`.',
    `2. Create and switch to a new branch with \`git switch -c ${branch}\`; if that fails because it exists, end with \`RESULT: branch-exists\`.`,
    '3. End with `RESULT: ok <sha>` on its own line, where sha is `git rev-parse HEAD`.',
  ].join(' '),
  { label: 'prep', agentType: 'test-runner', ...tune('test-runner') },
)
const prepMatch = prep?.match(/RESULT: (ok|dirty|branch-exists)(?: (\S+))?/)
if (prepMatch?.[1] !== 'ok') return { status: 'not-started', reason: prepMatch?.[1] ?? `prep failed: ${agentError('prep') ?? 'unknown'}` }
const baseSha = prepMatch[2]

phase('Steps')
// The step changed something, the whole suite is green, no test was edited, no new file appeared, and the
// step may not add more lines than it removes.
const gate = [
  checkCmd,
  '[ -n "$(git status --porcelain)" ]', // a step that changed nothing is not a step
  `[ -z "$(git diff --name-only HEAD -- ${TEST_PATHS})" ]`,
  '[ -z "$(git ls-files --others --exclude-standard)" ]',
  `[ "$(git diff HEAD --numstat | awk '{a+=$1; d+=$2} END{print a-d+0}')" -le ${maxNet} ]`,
].join(' && ')

const shq = t => `'${String(t).replace(/'/g, `'\\''`)}'`
const applied = []
const skipped = []
for (const c of steps) {
  const label = `step:${c.id}`
  // Dead code has no behaviour to pin; pinning it would only make it a live import.
  if (!c.pinned && c.kind !== 'dead-code') {
    const pin = await agent(
      [
        `Write at most 2 characterization tests that pin the CURRENT observable behaviour (outputs, errors, side effects) of the code at ${c.where} in ${c.file}, so a later change to it would be caught.`,
        `They must pass on the current code. The whole suite runs with: ${checkCmd}`,
        'Exception to your usual rules for this run: commit them (message "test: pin behaviour before refactor"). Do not touch production code.',
      ].join(' '),
      { label: `pin:${c.id}`, phase: 'Steps', agentType: 'test-writer', gate: checkCmd, ...tune('test-writer') },
    )
    if (pin === null) {
      skipped.push({ id: c.id, reason: `could not pin its behaviour: ${(agentError(`pin:${c.id}`) ?? '').slice(0, 200)}` })
      continue
    }
  }
  const prompt = [
    `Apply exactly ONE change in ${c.file}, at ${c.where}: ${c.change}`,
    `Goal: ${goal}. It is atomic: do not combine it with any other cleanup.`,
    'Behaviour must stay identical: same outputs, errors, side effects and ordering.',
    'Do not edit tests. Do not add files, types, interfaces, parameters, options or layers. Do not commit.',
    `Before you finish, \`${checkCmd}\` must pass.`,
  ].join(' ')
  // Committing is part of the gate, so it happens exactly once and only after the checks pass.
  const stepGate = `${gate} && git add -A && git commit -q -m ${shq(`refactor: ${c.change.slice(0, 70)}`)}`
  let done = await agent(prompt, { label, phase: 'Steps', gate: stepGate, ...tune('refactor') })
  if (done === null) {
    const why = (agentError(label) ?? 'no reason').slice(0, 300)
    await agent(
      `The gate failed: ${why}. Fix it within the same single change (no tests edited, no new files, net lines not increasing), or finish with the change as small as it can be. Do not commit.`,
      { label, resume: label },
    )
    done = await agent(`Run \`${checkCmd}\` and report failures only. Change nothing.`, {
      label: `${label}:verify`,
      agentType: 'test-runner',
      gate: stepGate,
      ...tune('test-runner'),
    })
  }
  if (done === null) {
    await agent(
      'Discard ONLY the uncommitted changes: run `git restore --staged --worktree .`, then delete the untracked files listed by `git ls-files --others --exclude-standard`. Do not touch commits. Reply REVERTED.',
      { label: `revert:${c.id}`, agentType: 'test-runner', ...tune('test-runner') },
    )
    skipped.push({ id: c.id, reason: `reverted after two failed attempts: ${(agentError(`${label}:verify`) ?? agentError(label) ?? '').slice(0, 200)}` })
    continue
  }
  applied.push({ id: c.id, kind: c.kind, change: c.change, estimatedLinesRemoved: c.linesRemoved })
}

phase('Review')
if (applied.length === 0) return { status: 'nothing-applied', branch, skipped }
const review = await agent(
  [
    `Review the refactor on branch ${branch}: \`git diff ${baseSha} HEAD\`. Goal was: ${goal}.`,
    'List any behaviour change you can show (outputs, errors, side effects, ordering), and any abstraction, helper, option or layer that was ADDED rather than removed.',
    `Report the net line change of the NON-test files only, from \`git diff --numstat ${baseSha} HEAD\` (added minus removed), as netLines. Pinning tests added before a step do not count. ok=true only if there are no behaviour changes, no added abstractions, and netLines is not positive. A removed export that has no importers anywhere in the repo and is not part of a published API is a note, not a behaviour change.`,
    `Run \`${checkCmd}\` yourself.`,
  ].join(' '),
  { label: 'review', agentType: 'reviewer', schema: VERDICT, ...tune('reviewer') },
)
return { status: review?.ok ? 'ok' : 'needs-attention', branch, baseSha, applied, skipped, review, note: `one commit per applied step on ${branch}; see git log ${baseSha}..HEAD` }
