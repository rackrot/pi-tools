---
name: route-negative-dependabot-yml
description: "Routing, near-miss negative. Writing .github/dependabot.yml is the same kind of job with a different tool; the description excludes it."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a .github/dependabot.yml for this repo on GitHub: npm and github-actions ecosystems, checked weekly, with minor and patch updates grouped into one PR per ecosystem.
