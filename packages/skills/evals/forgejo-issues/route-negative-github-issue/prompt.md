---
name: route-negative-github-issue
description: "Near miss: the same filing request against a github.com repo belongs to gh-issues, not to the fj skill."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

File an issue on github.com/acme/widgets: CSV export drops the last row when the file has no trailing newline. Label it bug and put it in the v2.0 milestone.
