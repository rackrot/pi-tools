---
name: route-negative-github-pr
description: "Near miss: a pull request on a github.com remote belongs to gh-pr, not forgejo-pr."
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

My branch feature/audit-log is pushed to github.com/acme/billing. Open a draft pull request against main and write a description the reviewers can get through quickly.
