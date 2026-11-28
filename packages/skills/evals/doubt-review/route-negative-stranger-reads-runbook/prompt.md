---
name: route-negative-stranger-reads-runbook
description: "Near miss: a fresh reader checking whether a runbook stands on its own before it is published belongs to cold-read. Nothing is being disproved and no decision is at stake, so doubt-review must stay quiet."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

before i publish this to the team wiki: i wrote it, so i can't tell any more whether it makes sense to somebody who wasn't there. get a fresh pair of eyes on it and tell me where a new on-call engineer would get stuck. there are no files to open, this is the whole page:

# Failing over the queue

1. Check the lag board. If the usual consumer is behind, go to step 2.
2. Flip the switch in the admin tool to the standby.
3. Wait for the drain, then run the fix-up script from the ops repo.
4. Tell the channel.

If it does not come back, do what we did in March.
