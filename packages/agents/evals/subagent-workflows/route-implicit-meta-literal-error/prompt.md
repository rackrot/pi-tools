---
name: route-implicit-meta-literal-error
description: "Implicit trigger: an error message from a script that calls phase() and agent(), with no mention of workflows, subagents or the tool."
tags: [trigger]
runs: 1
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

handler-audit.js dies before a single agent starts:

```
meta object must be a PURE LITERAL
```

Top of the file:

```js
const PHASES = ['List', 'Audit']
export const meta = { name: 'handler-audit', description: `Audit in ${PHASES.length} phases`, phases: PHASES }

phase('List')
const files = await agent(`List the handler files under ${args.root}`, { label: 'list', agentType: 'Explore' })
```

What does it want from me?
