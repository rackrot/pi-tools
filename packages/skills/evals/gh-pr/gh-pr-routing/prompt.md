---
name: gh-pr-routing
description: Explicit trigger. Opening a pull request for a finished branch on a github.com remote should read gh-pr.
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

My branch feature/rate-limit is finished and the remote is github.com/acme/gateway. Open a pull request for it against main, and write the description so whoever reviews it can get through it fast.
