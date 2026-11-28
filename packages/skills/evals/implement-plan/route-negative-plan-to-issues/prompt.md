---
name: route-negative-plan-to-issues
description: "Near miss. A plan file with slices is to be filed as linked GitHub issues, not built; that is issue-breakdown, and implement-plan must stay quiet."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

docs/plans/billing-migration.md got approved this morning. nobody is building it yet, the team picks work from the board. turn each slice into a GitHub issue with the blocked-by links between them so they can grab them in order.
