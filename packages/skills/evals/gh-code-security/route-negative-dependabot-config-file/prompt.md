---
name: route-negative-dependabot-config-file
description: "Near miss: writing .github/dependabot.yml (update schedule and grouping) is Dependabot configuration, which the skill excludes; it only triages Dependabot alerts."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Dependabot opens fifteen separate npm PRs on our GitHub repo every Monday and nobody reviews them. Write me a .github/dependabot.yml that checks npm and github-actions weekly, puts all minor and patch npm bumps into one grouped PR, leaves majors separate, and caps open PRs at 5.
