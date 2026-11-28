---
name: route-implicit-oncall-runbook
description: Implicit trigger. The user never asks for a review by name; they worry that a runbook written inside a long session will not make sense to someone who was not there.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we've been at this incident together since this morning and I wrote the runbook below at the end of it. Priya takes over on-call tomorrow and wasn't in any of it. I know too much by now to judge it, what is she going to trip over?

```
# Billing restore

1. Fail over to the standby the same way we did on Tuesday.
2. Run the replay script against the affected window.
3. Check the dashboard until the lag is back to normal, then flip the flag back.
4. Tell Marco.
```
