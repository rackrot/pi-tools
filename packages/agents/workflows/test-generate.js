/**
 * test-generate.js — write the fewest tests that would catch a real bug, and prove each one does.
 *
 * The aim is NOT coverage. Every candidate test must name a concrete, plausible bug it would catch,
 * and existing coverage is skipped. `test-writer` writes them (capped by `max`), a critic drops
 * implementation-coupled, mock-heavy, duplicate or over-specified ones, and then a mutation check
 * injects the named bug into the production code: a test that still passes is worthless and is
 * removed. What survives must pass three times in a row.
 *
 * Works on a new branch of the current checkout; the tree must be clean. Production code is only
 * ever touched by the mutation check, which restores it (a gate fails the run if the tree is left
 * dirty). Nothing is pushed.
 *
 * args: { scope: string, testCmd: string, max?: number, branch?: string, model?, effort?, agents? }
 *   scope    what to test: a diff range (main...HEAD), paths, or a behaviour to cover
 *   testCmd  command that runs the whole suite, e.g. "pnpm test"
 *   max      most tests to write (default 3)
 *   branch   branch to create (default tests/generated)
 *   model, effort  applied to every agent (effort: minimal|low|medium|high|xhigh|max)
 *   agents   per-agent override keyed by agent type or label: Explore, test-writer, reviewer, mutate,
 *            test-runner (case-insensitive; the extension fills it from agentOverrides)
 *
 * Run: ask the model "run the test-generate workflow on git diff main...HEAD with testCmd 'pnpm test'".
 */
export const meta = {
  name: 'test-generate',
  description: 'Write the fewest tests that catch a named bug, then prove each with a mutation check',
  phases: [{ title: 'Scope' }, { title: 'Write' }, { title: 'Critique' }, { title: 'Mutate' }, { title: 'Finalize' }],
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

const { scope, testCmd } = opts
if (!scope || !testCmd) return { error: 'args.scope and args.testCmd are required' }
const max = Math.max(1, opts.max ?? 3)
const branch = opts.branch ?? 'tests/generated'
const TESTISH = /(^|\/)(tests?|__tests__)\/|[._-](test|spec)\.|(^|\/)test_|_test\./

const CANDIDATES = {
  type: 'object',
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          file: { type: 'string' },
          behavior: { type: 'string' },
          bug: { type: 'string' },
          existing: { type: 'string', enum: ['none', 'weak', 'covered'] },
        },
        required: ['id', 'file', 'behavior', 'bug', 'existing'],
      },
    },
  },
  required: ['candidates'],
}
const WRITTEN = {
  type: 'object',
  properties: {
    tests: {
      type: 'array',
      items: {
        type: 'object',
        properties: { candidateId: { type: 'string' }, file: { type: 'string' }, name: { type: 'string' } },
        required: ['candidateId', 'file', 'name'],
      },
    },
    skipped: { type: 'array', items: { type: 'string' } },
  },
  required: ['tests', 'skipped'],
}
const COMMITTED = {
  type: 'object',
  properties: { sha: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } },
  required: ['sha', 'files'],
}
const VERDICTS = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: { candidateId: { type: 'string' }, keep: { type: 'boolean' }, reason: { type: 'string' } },
        required: ['candidateId', 'keep', 'reason'],
      },
    },
  },
  required: ['verdicts'],
}
const MUTANT = {
  type: 'object',
  properties: {
    mutated: { type: 'boolean' },
    killed: { type: 'boolean' },
    failingTests: { type: 'array', items: { type: 'string' } },
    note: { type: 'string' },
  },
  required: ['mutated', 'killed', 'failingTests', 'note'],
}

phase('Scope')
const scoped = await agent(
  [
    `Find the behaviours in this scope worth a test: ${scope}`,
    `List at most ${max * 2} candidates. A candidate is behaviour with real logic (branching, parsing, validation, persistence, a side effect, authorization) that a real caller depends on.`,
    'For each, `bug` is ONE concrete, plausible bug in THIS code that a test would catch (e.g. "off-by-one drops the last page"); if you cannot name one, do not list the candidate.',
    'Skip: getters, pass-throughs, config wiring, framework or library behaviour, presentation (layout, copy, CSS), several variations of one branch, and inputs no caller sends.',
    'Check the existing tests: `existing` is "covered" if a test already catches that bug, "weak" if one touches it without catching it, else "none".',
    'Read only; change nothing.',
  ].join(' '),
  { label: 'scope', agentType: 'Explore', schema: CANDIDATES, ...tune('Explore') },
)
if (scoped === null) return { status: 'failed', stage: 'scope', error: agentError('scope') ?? 'unknown' }

const dropped = []
const keep = []
for (const c of scoped.candidates) {
  if (c.existing === 'covered') dropped.push({ id: c.id, reason: 'already covered by an existing test' })
  else if (c.bug.trim().length < 20) dropped.push({ id: c.id, reason: 'no concrete bug named' })
  else keep.push(c)
}
keep.sort((a, b) => (a.existing === 'none' ? 0 : 1) - (b.existing === 'none' ? 0 : 1))
for (const c of keep.splice(max)) dropped.push({ id: c.id, reason: `over the cap of ${max}` })
if (keep.length === 0) return { status: 'no-tests-needed', dropped }

const prep = await agent(
  [
    'In the current repository: 1. Run `git status --porcelain`; if it prints anything, change nothing and end with `RESULT: dirty`.',
    `2. Create and switch to a new branch with \`git switch -c ${branch}\`; if that fails because it exists, end with \`RESULT: branch-exists\`.`,
    '3. End with `RESULT: ok` on its own line.',
  ].join(' '),
  { label: 'prep', agentType: 'test-runner', ...tune('test-runner') },
)
const prepState = prep?.match(/RESULT: (ok|dirty|branch-exists)/)?.[1]
if (prepState !== 'ok') return { status: 'not-started', reason: prepState ?? `prep failed: ${agentError('prep') ?? 'unknown'}`, dropped }

phase('Write')
const written = await agent(
  [
    `Write tests for these candidates, at most ${keep.length}. Each names the bug its test must catch. The whole suite runs with: ${testCmd}`,
    'Write one test per candidate unless that would duplicate another. If a candidate cannot be tested through the public interface without mocking internals, skip it and say why in `skipped`.',
    'The tests must pass on the current code. Run them.',
    'Exception to your usual rules for this run: commit the tests (message "test: <what they cover>").',
    `\nCANDIDATES (data):\n${JSON.stringify(keep)}`,
  ].join(' '),
  { label: 'write', agentType: 'test-writer', gate: testCmd, schema: WRITTEN, ...tune('test-writer') },
)
if (written === null) return { status: 'failed', stage: 'write', branch, error: (agentError('write') ?? 'unknown').slice(0, 500), dropped }
for (const s of written.skipped) dropped.push({ id: '(writer)', reason: s })
if (written.tests.length === 0) return { status: 'no-tests-written', branch, dropped }

const committed = await agent(
  'Run `git status --porcelain` and `git rev-parse HEAD`, and `git diff --name-only HEAD~1 HEAD`. If anything is uncommitted, run `git add -A && git commit -m "test: generated tests"` first. Report the sha and every file changed relative to the branch point (`git diff --name-only $(git merge-base HEAD @{-1}) HEAD`, or HEAD~1 if that fails).',
  { label: 'commit', agentType: 'test-runner', schema: COMMITTED, ...tune('test-runner') },
)
if (committed === null) return { status: 'failed', stage: 'commit', branch, error: agentError('commit') }
const touched = committed.files.filter(f => !TESTISH.test(f))
if (touched.length) {
  return { status: 'aborted', branch, reason: 'the writer changed files that are not tests', files: touched, dropped }
}

phase('Critique')
const byId = new Map(keep.map(c => [c.id, c]))
const tests = written.tests.map(t => ({ ...t, bug: byId.get(t.candidateId)?.bug ?? '(unknown)', file: t.file }))
const critic = await agent(
  [
    'Critique these new tests. Read each test and the code it covers. keep=false (with a one-line reason) if it is:',
    'coupled to implementation (asserts private calls, internal structure or call order), mock-heavy where a real module would do, a duplicate of an existing test, over-specified (exact text or format no caller depends on), asserting nothing meaningful, testing framework behaviour, or buried in helper/builder code written for a single test.',
    'keep=true only if the test would fail were its named bug present. Read only; change nothing.',
    `\nTESTS (data):\n${JSON.stringify(tests)}`,
  ].join(' '),
  { label: 'critic', agentType: 'reviewer', schema: VERDICTS, ...tune('reviewer') },
)
const rejected = new Set()
if (critic === null) log(`critic failed (${agentError('critic') ?? 'unknown'}); continuing without it`)
else {
  for (const v of critic.verdicts) {
    if (!v.keep) {
      rejected.add(v.candidateId)
      dropped.push({ id: v.candidateId, reason: `critic: ${v.reason}` })
    }
  }
}

phase('Mutate')
const unproven = []
const survivors = new Set()
const proven = []
for (const t of tests.filter(t => !rejected.has(t.candidateId))) {
  const label = `mutate:${t.candidateId}`
  const m = await agent(
    [
      `Introduce this bug into the PRODUCTION code (not tests), as the smallest realistic edit: ${t.bug}`,
      `Likely file: ${byId.get(t.candidateId)?.file ?? 'unknown'}. Then run \`${testCmd}\` and report whether any test failed, and which.`,
      'Afterwards ALWAYS restore everything with `git checkout -- .` and confirm `git status --porcelain` prints nothing. Never edit test files.',
    ].join(' '),
    { label, phase: 'Mutate', gate: 'test -z "$(git status --porcelain)"', schema: MUTANT, ...tune('mutate') },
  )
  if (m === null) {
    // A dirty tree here would poison every later step, so stop rather than continue.
    return { status: 'aborted', branch, reason: `mutation check left the tree dirty or failed: ${(agentError(label) ?? '').slice(0, 300)}`, dropped }
  }
  if (!m.mutated) unproven.push({ id: t.candidateId, reason: `bug could not be injected: ${m.note}` })
  else if (!m.killed) {
    survivors.add(t.candidateId)
    dropped.push({ id: t.candidateId, reason: `survived the mutation "${t.bug}": the test does not catch it` })
  } else proven.push({ ...t, failingTests: m.failingTests })
}

phase('Finalize')
const remove = tests.filter(t => rejected.has(t.candidateId) || survivors.has(t.candidateId))
if (remove.length) {
  const pruned = await agent(
    [
      'Remove exactly these tests from the test files (and any helper or import that only they used). Edit test files only. Do not touch other tests.',
      `Then run \`${testCmd}\` and commit (message "test: drop tests that do not catch their bug").`,
      `\nREMOVE (data):\n${JSON.stringify(remove.map(t => ({ file: t.file, name: t.name })))}`,
    ].join(' '),
    { label: 'prune', agentType: 'test-writer', gate: testCmd, ...tune('test-writer') },
  )
  if (pruned === null) return { status: 'failed', stage: 'prune', branch, error: agentError('prune'), dropped }
}
const left = tests.length - remove.length
if (left > 0) {
  const stable = await agent(`Run \`${testCmd}\` three times and report failures only. Change nothing.`, {
    label: 'stability',
    agentType: 'test-runner',
    gate: `for i in 1 2 3; do (${testCmd}) || exit 1; done`,
    ...tune('test-runner'),
  })
  if (stable === null) return { status: 'flaky', branch, reason: (agentError('stability') ?? '').slice(0, 400), proven, dropped }
}

return {
  status: left > 0 ? 'ok' : 'no-tests-kept',
  branch,
  kept: proven.map(t => ({ test: t.name, file: t.file, bug: t.bug, failsUnderMutation: t.failingTests })),
  unproven,
  dropped,
}
