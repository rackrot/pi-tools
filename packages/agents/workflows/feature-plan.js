/**
 * feature-plan.js — plan a feature so `plan-slice-implement` can build it.
 *
 * Maps the code the feature touches (including what can be REUSED), writes a plan of small slices
 * with disjoint write surfaces, dependencies, acceptance checks and a gate, then a skeptic panel
 * attacks it: over-engineering and missed reuse, slicing, risk and security, and test value. A
 * reviser applies what holds. Decisions only you can make go to a "Decisions" section instead of
 * being guessed. It stops at the plan file: you read it, approve it, and then run
 * plan-slice-implement on it. Nothing is built.
 *
 * The plan format is the one plan-slice-implement reads: "### S1 — title", then Writes, Depends on,
 * Acceptance lines, and an empty "## Status" block.
 *
 * args: { feature: string, out: string, spec?: string, gateCmd?: string, maxSlices?: number,
 *         model?, effort?, agents? }
 *   feature    what to build, in a sentence or a paragraph
 *   out        file to write the plan to (markdown)
 *   spec       path of a spec to plan against (from spec-develop)
 *   gateCmd    the command every slice must pass, if you know it; otherwise the plan names one
 *   maxSlices  most slices (default 8); more means the feature should be split
 *   model, effort  applied to every agent (effort: minimal|low|medium|high|xhigh|max)
 *   agents     per-agent override keyed by agent type or label: Explore, Plan, reuse, slicing, risk,
 *              testing, revise, write (case-insensitive; the extension fills it from agentOverrides)
 *
 * Run: ask the model "run the feature-plan workflow for <feature>, writing docs/plans/<name>.md".
 */
export const meta = {
  name: 'feature-plan',
  description: 'Plan a feature as small gated slices, attack the plan with skeptics, write a plan file for plan-slice-implement',
  phases: [{ title: 'Map' }, { title: 'Plan' }, { title: 'Critique' }, { title: 'Revise' }, { title: 'Write' }],
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

const { feature, out } = opts
if (!feature || !out) return { error: 'args.feature and args.out are required' }
const maxSlices = opts.maxSlices ?? 8

const MAP = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    reuse: { type: 'array', items: { type: 'string' } },
    touches: { type: 'array', items: { type: 'string' } },
    conventions: { type: 'array', items: { type: 'string' } },
    checkCmd: { type: 'string' },
  },
  required: ['summary', 'reuse', 'touches', 'conventions', 'checkCmd'],
}
const PLAN = {
  type: 'object',
  properties: {
    plan: { type: 'string' },
    slices: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          writes: { type: 'array', items: { type: 'string' } },
          dependsOn: { type: 'array', items: { type: 'string' } },
        },
        required: ['id', 'title', 'writes', 'dependsOn'],
      },
    },
    decisions: { type: 'array', items: { type: 'string' } },
  },
  required: ['plan', 'slices', 'decisions'],
}
const ISSUES = {
  type: 'object',
  properties: {
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          where: { type: 'string' },
          problem: { type: 'string' },
          fix: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          needsHuman: { type: 'boolean' },
        },
        required: ['where', 'problem', 'fix', 'severity', 'needsHuman'],
      },
    },
  },
  required: ['issues'],
}

const FORMAT = [
  'Markdown with: a title "# Plan: <feature>"; "## Reuse analysis" (existing code and packages reviewed, chosen approach: reuse, extend, extract or new, and why; duplication risk);',
  '"## Approach" (short); "## Slices" where EACH slice is a heading "### S1 — <title>" followed by lines "Writes: <paths>", "Depends on: <ids or none>", "Acceptance: <observable checks, and the gate command>", and a short body saying what to build;',
  '"## Risks"; "## Decisions" (choices only the owner can make; never guess them); and an empty "## Status" section.',
  `Slices must be small, have DISJOINT write surfaces unless one depends on the other, and each be checkable on its own. Use at most ${maxSlices} slices.`,
].join(' ')

const LENSES = {
  reuse: 'Over-engineering and missed reuse: could existing code or an existing package do this? Is any slice, abstraction, option, file or config something nobody asked for? Is the plan copying an existing implementation?',
  slicing: 'Slicing: are write surfaces really disjoint? Are dependencies correct and complete? Can each slice be checked alone? Is any slice too big to review, or so small it is just overhead? Is the order sound?',
  risk: 'Risk and security: what breaks, what is irreversible, what touches data, auth, secrets, migrations or public APIs? What is missing from the plan to handle it (only what this feature really touches)?',
  testing: 'Test value: does the plan test business rules, boundaries and bugs likely in THIS code, with few tests? Flag tests that only restate the code, mock heavily, or cover framework behaviour, and flag a missing test for real logic.',
}

phase('Map')
const spec = opts.spec ? `Read the spec at ${opts.spec} first; it is the requirement.` : ''
const map = await agent(
  `Map the codebase in the current directory for building this feature: ${feature}\n${spec} Report: a short summary of where it fits; existing code, modules or packages that can be REUSED or extended; the paths a change would touch; the conventions to follow (naming, structure, test style); and the command that runs the project's checks. ${opts.gateCmd ? `The user gave the gate command: ${opts.gateCmd}.` : ''} Read only; change nothing.`,
  { label: 'map', agentType: 'Explore', schema: MAP, ...tune('Explore') },
)
if (map === null) return { status: 'failed', stage: 'map', error: agentError('map') ?? 'unknown' }
const gateCmd = opts.gateCmd ?? map.checkCmd

phase('Plan')
const plan = await agent(
  `Plan this feature: ${feature}\n${spec} ${FORMAT} The gate command for every slice is: ${gateCmd}. Prefer reusing what the map found; add something new only with a stated reason. Put every real choice the owner must make under Decisions, with your recommendation, instead of deciding it. Return the whole plan as markdown in \`plan\`, plus the slice list and decisions. Do not modify files.\nMAP (data): ${JSON.stringify(map)}`,
  { label: 'plan', agentType: 'Plan', schema: PLAN, ...tune('Plan') },
)
if (plan === null) return { status: 'failed', stage: 'plan', error: agentError('plan') ?? 'unknown' }
if (plan.slices.length > maxSlices) return { status: 'too-big', slices: plan.slices.length, advice: `the plan needs ${plan.slices.length} slices (max ${maxSlices}); split the feature and plan the parts separately` }

phase('Critique')
const panel = await parallel(
  Object.entries(LENSES).map(([name, lens]) => () =>
    agent(
      `Attack this plan through ONE lens, ${name}: ${lens} Report only real problems with a fix for each. needsHuman=true when the fix is a decision for the owner. Severity high = the plan would produce the wrong thing or fail.\nPLAN:\n${plan.plan}\nMAP (data): ${JSON.stringify(map)}\nRead the code to check claims. Read only; change nothing.`,
      { label: name, agentType: 'reviewer', phase: 'Critique', schema: ISSUES, ...tune(name) },
    ).then(r => ({ name, issues: r?.issues ?? null })),
  ),
)
const failedLenses = panel.filter(p => p.issues === null).map(p => p.name)
if (failedLenses.length) log(`critics failed: ${failedLenses.join(', ')}`)
const issues = panel.flatMap(p => (p.issues ?? []).map(i => ({ ...i, lens: p.name }))).filter(i => i.severity !== 'low')

let finalPlan = plan.plan
let decisions = plan.decisions
let slices = plan.slices
if (issues.length) {
  phase('Revise')
  const revised = await agent(
    `Revise this plan to fix these issues. Keep the same format and slice heading style. Remove anything that is over-engineered; use existing code where the critic found it; fix write surfaces and dependencies. Where an issue needs an owner decision (needsHuman), add it to Decisions with a recommendation instead of deciding. Do not add scope.\nISSUES (data): ${JSON.stringify(issues)}\nPLAN:\n${plan.plan}\nReturn the whole revised plan as markdown in \`plan\`, the slice list, and the decisions. Do not modify files.`,
    { label: 'revise', agentType: 'Plan', schema: PLAN, ...tune('revise') },
  )
  if (revised === null) log(`revision failed (${agentError('revise') ?? 'unknown'}); writing the unrevised plan with the issues listed`)
  else if (revised.slices.length <= maxSlices) {
    finalPlan = revised.plan
    decisions = revised.decisions
    slices = revised.slices
  }
}
const ids = slices.map(s => s.id)
const badDeps = slices.flatMap(s => s.dependsOn.filter(d => !ids.includes(d)).map(d => `${s.id} -> ${d}`))
if (badDeps.length) return { status: 'invalid-plan', reason: 'a slice depends on a slice that does not exist', badDeps }

phase('Write')
const unrevised = issues.length && finalPlan === plan.plan ? `\n\n## Unaddressed review issues\n${issues.map(i => `- (${i.lens}, ${i.severity}) ${i.problem} Fix: ${i.fix}`).join('\n')}\n` : ''
const wrote = await agent(
  `Write this markdown to ${out} exactly as given (create directories if needed), then reply DONE.\n${finalPlan}${unrevised}`,
  { label: 'write', ...tune('write') },
)
if (wrote === null) return { status: 'failed', stage: 'write', error: agentError('write') }
return {
  status: decisions.length ? 'needs-decisions' : 'ready',
  out,
  gateCmd,
  slices: slices.map(s => ({ id: s.id, title: s.title, dependsOn: s.dependsOn })),
  decisions,
  reviewIssues: issues.length,
  next: `read ${out}, settle the decisions, then run plan-slice-implement with planPath ${out} and gateCmd "${gateCmd}"`,
}
