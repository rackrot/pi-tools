---
name: value-v0-invoked
description: Value case. The slash command with no mode argument runs the default v0 mode. Run with --ablation none; the bare arm cannot run the command. Graders read the file only.
tags: [value]
runs: 3
max_turns: 10
allowed_tools: [Read, Write, Edit, Glob, Grep, Skill]
---

/doc-tidy:doc-tidy SETUP.md
