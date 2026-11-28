---
name: route-implicit-approval-blocked
description: "Implicit trigger: a PR whose approval is blocked by a reviewer, with no mention of comments, threads, triage or a forge name beyond the URL."
tags: [trigger]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Dana won't approve https://github.com/acme/ledger/pull/58 until I deal with what she wrote on it, and CodeRabbit dumped a wall of suggestions on top. Get me to the point where I know what is left to do on this branch.
