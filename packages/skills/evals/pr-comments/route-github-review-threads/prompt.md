---
name: route-github-review-threads
description: "Explicit trigger: unresolved review threads from a bot and two humans on a GitHub PR, to be sorted before any edit."
tags: [trigger]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Copilot and two teammates left a pile of inline threads on https://github.com/acme/ledger/pull/41 overnight. Sort out which of them I should actually fix and which I should argue against, and don't touch the code until I say which.
