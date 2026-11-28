---
name: route-implicit-patch-notes-runbook
description: "Implicit trigger: an on-call runbook whose corrections were appended as notes at the bottom, described by its symptom (people follow the superseded step), without the words clean up, refresh, drift or rewrite."
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Twice this month someone on call followed step 2 of this runbook and never saw the correction further down. Can you sort it out so that can't happen? Runbook is pasted below.

```
# Restarting the queue

1. Page the queue owner.
2. Run `queuectl drain --all` and wait for the depth to hit zero.
3. Run `queuectl restart`.
4. Confirm the depth is rising again on the dashboard.

NOTE 12 Feb: do NOT use --all any more, it drains the billing queue too. Use `queuectl drain --group web`.
NOTE 3 Mar: step 1 only applies outside office hours now.
NOTE 20 Mar: dashboard moved, the old link in the wiki is dead. Use the "Queues" board.
```
