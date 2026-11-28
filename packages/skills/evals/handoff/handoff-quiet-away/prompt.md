---
name: handoff-quiet-away
description: "Manual-only guard: a returning-human question must not invoke handoff; it belongs to catchup."
tags: [trigger]
runs: 1
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

I've been away two days, what happened here?
