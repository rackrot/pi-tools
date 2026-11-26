---
name: set-aside-work
description: Outcome case. Fixing something else first without losing work in progress uses jj (no git stash or checkout).
tags: [outcome]
runs: 1
max_turns: 12
model: claude-sonnet-5-5
allowed_tools: [Bash, Read, Write, Edit, Skill]
---

I'm in the middle of editing greet.py and it's not ready. Before I continue, change the title line in README.md to "# demo app" as its own separate commit, without losing my greet.py edits. Tell me where my unfinished work ended up.
