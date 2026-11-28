---
name: route-negative-security-md-and-ruleset
description: "Near miss: a SECURITY.md, CODEOWNERS and a branch ruleset are repository surface setup (gh-repo-setup), not secret scanning, push protection or alert triage."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We're opening acme/ledger on GitHub to outside contributors next week. Before that I want a SECURITY.md that tells people where to send vulnerability reports, a CODEOWNERS file so the payments team reviews anything under src/payments/, and a ruleset on main that requires a PR with one approval and blocks force pushes. Show me the plan first, then the gh commands.
