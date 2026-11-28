---
name: value-script-runtime-behaviour
description: "Value case. Runtime behaviour of a SubagentWorkflow script that a model guesses wrong: silent agentType fallback, null instead of a rejection, Date.now throwing, resume replaying only the leading calls, gate not combinable with resume."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Reviewing a teammate's SubagentWorkflow script (pi-subagents) before we point it at about 300 files. The only defined agent types here are `reviewer`, `security-auditor`, `test-runner` and the built-ins `Explore`, `Plan`, `general-purpose`; `fallbackSubagent` is at its default.

```js
export const meta = { name: 'handler-audit', description: 'Audit every handler', phases: ['List', 'Audit', 'Report'] }

phase('List')
const listed = await agent(`List the handler files under ${args.root}`, {
  label: 'list', agentType: 'Explore',
  schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string' } } }, required: ['files'] },
})

const findings = await parallel(listed.files.map((f, i) => () =>
  agent(`Audit ${f} for injection and authz bugs`, { label: `audit-${i}`, phase: 'Audit', agentType: 'security-reviewer' })))

phase('Report')
const runId = `audit-${Date.now()}`
await agent(`Summarise these findings: ${JSON.stringify(findings)}`, { label: 'report' })
return { runId, count: findings.length }
```

The pi-subagents source is not checked out on this machine, so there is no package code to read. Five questions about what actually happens:

- Q1: `security-reviewer` is not a defined agent type. What happens at the audit calls? (A) the run is rejected before any agent starts, (B) each `agent()` call throws an unknown-agent-type error, (C) each call runs anyway as a `general-purpose` agent and nothing reports the mismatch.
- Q2: one of the 300 audit agents fails terminally. What does `parallel` do? (A) it rejects and the script stops, (B) that entry in `findings` is `null` and the rest carry on, (C) that entry is an Error object.
- Q3: the `Date.now()` line. (A) works as in any JavaScript, (B) returns a frozen constant so runs are reproducible, (C) throws.
- Q4: say the run finishes. I then change only the options of the audit calls and call again with `scriptPath` plus `resumeFromRunId`. Which agents are replayed from the journal instead of run again? (A) every agent whose prompt text is unchanged, so `list` and all the audits, (B) only the unchanged calls at the front of the script, so just `list`, (C) none, resume needs a byte-identical script.
- Q5: later I want a retry call that continues an earlier child with `resume: 'audit-7'` and also carries `gate: 'pnpm test'`. (A) fine, (B) not allowed, `resume` and `gate` cannot be on the same call, (C) allowed only if the call also has a `schema`.

End your reply with exactly one line per question in the form `Q1: A`, Q1 to Q5 in order.
