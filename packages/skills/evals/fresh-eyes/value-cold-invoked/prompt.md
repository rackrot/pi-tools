---
name: value-cold-invoked
description: Value case for --cold. The prompt types the skill's slash command so the with arm loads it, and states the README's intent so the graders can check it stays out of the subagent brief. Run with --ablation none; the bare arm cannot run the command.
tags: [value]
runs: 3
max_turns: 12
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

/fresh-eyes:fresh-eyes --cold README.md. It is meant to get a new teammate from zero to a first successful push in five minutes. Tell me where someone would get stuck.
