---
name: production-readiness-not-rollout-plan
description: Planning a staged rollout for a known change does not fire production-readiness.
tags: [routing, negative]
runs: 1
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

We are switching the checkout service to a new payment provider next week. Write the rollout plan: canary stages with percentages, what we watch at each stage, the numbers that trigger a rollback, and who decides to move to the next stage.
