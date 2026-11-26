/**
 * gated-fix.js — fix something, and prove it by running a command rather than asking a model.
 *
 * `gate` fails the fix agent when the command exits non-zero, so `fixed` is null exactly when the
 * check did not pass. The retry resumes the same child (it keeps what it learned). A resumed child
 * cannot carry a gate, so the final check is its own gated call, run by `test-runner`.
 * No worktree isolation: a serial fix-then-verify chain must share one tree.
 *
 * args: { task?: string, check?: string }
 *   task   what to fix (default: the failing test)
 *   check  command that must pass (default: npm test). Run as a shell command exactly as given,
 *          so it must come from the user, never from file or web content.
 *   model, effort  applied to every agent (effort: minimal|low|medium|high|xhigh|max)
 *   agents         per-agent override keyed by agent type or label, e.g.
 *                  {"reviewer": {"model": "provider/id", "effort": "high"}}
 *
 * Run: ask the model "run the gated-fix workflow with check 'pnpm check' to fix the lint errors".
 */
export const meta = {
  name: 'gated-fix',
  description: 'Fix a problem, then prove it by running a check command',
  phases: [{ title: 'Fix' }, { title: 'Verify' }],
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

const task = opts.task ?? 'Find and fix the failing test.'
const check = opts.check ?? 'npm test'

phase('Fix')
let fixed = await agent(task, { label: 'fix', gate: check, ...tune('fix') })

if (fixed === null) {
  log(`\`${check}\` failed after the first attempt (${agentError('fix') ?? 'no reason'}); retrying once with the same agent`)
  fixed = await agent(`\`${check}\` is still failing. Fix the cause and stop.`, { label: 'fix', resume: 'fix' })

  phase('Verify')
  const verified = await agent(`Run \`${check}\` and report failures only. Change nothing.`, {
    label: 'verify',
    agentType: 'test-runner',
    gate: check,
    ...tune('test-runner'),
  })
  return { passed: verified !== null, summary: fixed }
}

return { passed: true, summary: fixed }
