---
name: route-negative-single-bug-issue
description: "Routing, near-miss negative. Filing one bug as one GitHub issue belongs to gh-issues, not issue-breakdown."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the CSV export in acme/reports (github.com) drops the last row when a cell contains a newline. open an issue for it with the bug label and put it in the 2.4 milestone. show me the title and body first.
