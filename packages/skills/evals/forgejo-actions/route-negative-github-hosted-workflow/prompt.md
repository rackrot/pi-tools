---
name: route-negative-github-hosted-workflow
description: "Near miss: a failing GitHub Actions run on github.com. The description excludes GitHub-hosted Actions, so the skill must stay quiet."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the release job is red again on main, can you work out why? https://github.com/acme/platform/actions/runs/9184421337/job/25260318852
