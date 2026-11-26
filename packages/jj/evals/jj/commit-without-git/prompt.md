---
name: commit-without-git
description: Outcome case. In a colocated jj repo, finishing a change uses jj, never git write commands.
tags: [outcome]
runs: 1
max_turns: 10
model: claude-sonnet-5-5
allowed_tools: [Bash, Read, Skill]
---

I just edited greet.py to use an f-string. Commit it with a good message and leave me ready to start the next change.
