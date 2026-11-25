---
name: value-disprove-invoked
description: Value case for the default --disprove mode. The prompt types the skill's slash command so the with arm loads it, and states the author's own conclusion so the graders can check it stays out of the subagent brief. Run with --ablation none; the bare arm cannot run the command.
tags: [value]
runs: 3
max_turns: 12
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

/fresh-eyes:fresh-eyes PLAN.md and backfill.py. I'm convinced this is airtight: the checkpoint means a crash just resumes where it stopped. Give it a last check before I run it against production.
