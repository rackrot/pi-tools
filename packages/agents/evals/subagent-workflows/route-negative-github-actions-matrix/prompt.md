---
name: route-negative-github-actions-matrix
description: "Near miss: a CI workflow file that fans a job out over a matrix shares the words workflow and fan out, but is not a SubagentWorkflow script."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a GitHub Actions workflow that runs `pnpm test` on every pull request and fans the job out over Node 20 and 22 with a matrix.
