---
name: split-non-interactive
description: Outcome case. Splitting a two-file change into two changes uses a fileset and a message, never the interactive TUI.
tags: [outcome]
runs: 1
max_turns: 12
model: claude-sonnet-5-5
allowed_tools: [Bash, Read, Skill]
---

My working copy mixes a code change (greet.py) and a docs change (README.md). Split them into two separate changes, one per file, each with its own descriptive message.
