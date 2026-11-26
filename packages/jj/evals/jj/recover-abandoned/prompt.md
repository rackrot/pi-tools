---
name: recover-abandoned
description: Outcome case. A wrongly abandoned jj change is recovered from the operation log, not from git.
tags: [outcome]
runs: 1
max_turns: 12
model: claude-sonnet-5-5
allowed_tools: [Bash, Read, Skill]
---

I just ran `jj abandon` on the wrong change: the "add b" commit is gone. Get it back exactly as it was, with its message, and keep "add a" and "add c" in place.
