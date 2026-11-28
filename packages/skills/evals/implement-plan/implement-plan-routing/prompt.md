---
name: implement-plan-routing
description: A request to carry out an approved multi-slice plan file routes to implement-plan, not planning or coding.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

The plan in docs/plans/billing-migration.md is approved, including a commit per slice. Go ahead and build it, I don't need to sign off between slices.
