---
name: route-implicit-job-stuck-waiting
description: "Implicit trigger: a job that never starts after a move from GitHub to Codeberg (unmatched runs-on label). No workflow path, no run URL, no skill wording."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we moved the repo from GitHub to Codeberg last week and since then the test job never starts. it just shows a clock icon and says waiting, been like that for two days. nothing in the yaml changed, it still says runs-on: ubuntu-latest. what's going on?
