---
name: route-fold-review-fixes
description: "Routing, explicit. Folding review-fix commits into the commits they belong to and getting the branch current with main before a PR routes to git-history."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

my branch feature/export-csv has 7 commits and three of them are "fix lint", "address review" and "oops forgot file". before I ask for another review I want those three folded into the commits they actually belong to so the log reads as 4 clean commits, and the branch should sit on top of what's on main today (it's about 30 commits behind). nobody else has pulled the branch. tell me exactly what you'd run, I can't babysit an editor popping up.
