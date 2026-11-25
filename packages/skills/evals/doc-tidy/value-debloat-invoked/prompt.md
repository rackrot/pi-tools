---
name: value-debloat-invoked
description: Value case. The slash command types the debloat mode, so the skill loads. Run with --ablation none; the bare arm cannot run the command. Graders read the file only.
tags: [value]
runs: 3
max_turns: 10
allowed_tools: [Read, Write, Edit, Glob, Grep, Skill]
---

/doc-tidy:doc-tidy --debloat OPERATIONS.md
