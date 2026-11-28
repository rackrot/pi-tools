---
name: docs-audit-stale-setup-guide
description: "Implicit trigger: a setup guide that failed a new hire, and distrust of the rest of docs/, routes to docs-audit without the words audit or drift."
tags: [trigger]
runs: 1
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

A new hire lost a morning on our setup guide: `make bootstrap` doesn't exist any more and two of the env vars it lists aren't read anywhere. I don't trust the rest of docs/ now. Find out what else in there is wrong before the next person starts on Monday.
