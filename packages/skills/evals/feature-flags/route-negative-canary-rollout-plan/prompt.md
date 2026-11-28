---
name: route-negative-canary-rollout-plan
description: "Near miss: a written production rollout plan (canary or blue-green, signals per phase, rollback numbers) belongs to rollout-plan, not to adding or removing a flag in code."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we're putting the new search backend into production on Thursday. write up the plan for it: canary or blue-green, which traffic steps, what we watch at each step and the numbers at which we roll back.
