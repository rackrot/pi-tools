---
name: route-negative-backlog-triage
description: "Near miss: triaging a backlog of incoming issues and external PRs (labels, duplicates, readiness) is gh-triage's job; nobody is acting on review feedback left on the user's own PR."
tags: [trigger]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

github.com/acme/ledger has eleven open pull requests from outside contributors and I have not looked at any of them. Triage them for me: which are duplicates, which need more info from the author, and which are ready for a maintainer to look at.
