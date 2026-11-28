---
name: docs-audit-cli-drift
description: "Auditing docs for drift from the CLI routes to docs-audit."
tags: [trigger]
runs: 1
max_turns: 10
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

Audit the docs for drift from what the CLI actually does today.
