/**
 * review-panel.js — independent read-only reviews from different angles, then one reconciliation.
 *
 * The three reviewers have different briefs (spec correctness, security, does it pass checks), so
 * they catch different failures. `parallel` is a barrier here on purpose: the synthesis prompt
 * compares all the reviews at once.
 *
 * args: { scope?: string, spec?: string }
 *   scope  what to review, e.g. "git diff main...HEAD" (default: uncommitted changes)
 *   spec   path or text of the requirement the change must meet (default: none, review for defects)
 *   model, effort  applied to every agent (effort: minimal|low|medium|high|xhigh|max)
 *   agents         per-agent override keyed by agent type or label, e.g.
 *                  {"reviewer": {"model": "provider/id", "effort": "high"}}
 *
 * Run: ask the model "run the review-panel workflow on git diff main...HEAD against docs/plan.md".
 */
export const meta = {
  name: 'review-panel',
  description: 'Review a change for correctness, security and failing checks, then reconcile the findings',
  phases: [{ title: 'Review' }, { title: 'Synthesize' }],
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

const scope = opts.scope ?? 'the uncommitted changes (git diff HEAD)'
const spec = opts.spec ?? 'none given; report correctness defects only'

const REVIEWERS = [
  {
    label: 'review:correctness',
    agentType: 'reviewer',
    prompt: `Review ${scope} against this spec: ${spec}`,
  },
  {
    label: 'review:security',
    agentType: 'security-auditor',
    prompt: `Audit ${scope} for security problems.`,
  },
  {
    label: 'review:checks',
    agentType: 'test-runner',
    prompt: `Run the project's tests, typecheck and lint for ${scope}. Report only failures.`,
  },
]

phase('Review')
const reviews = await parallel(
  REVIEWERS.map(r => () => agent(r.prompt, { label: r.label, agentType: r.agentType, ...tune(r.agentType) })),
)

const usable = reviews
  .map((text, i) => ({ label: REVIEWERS[i].label, text }))
  .filter(r => r.text !== null)
for (let i = 0; i < reviews.length; i++) {
  if (reviews[i] === null) log(`${REVIEWERS[i].label} failed: ${agentError(REVIEWERS[i].label) ?? 'unknown'}`)
}
if (usable.length === 0) return { reviewed: 0, verdict: null }

phase('Synthesize')
const verdict = await agent(
  [
    `Reconcile these independent reviews of ${scope}. Merge duplicates, drop findings you can show are wrong, and order the rest by severity. Where reviews disagree, say which is right and why.`,
    ...usable.map(r => `\n## ${r.label}\n${r.text}`),
  ].join('\n'),
  { label: 'synthesize', ...tune('synthesize', { effort: 'high' }) },
)

return { reviewed: usable.length, failed: reviews.length - usable.length, verdict }
