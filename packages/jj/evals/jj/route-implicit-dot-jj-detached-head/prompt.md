---
name: route-implicit-dot-jj-detached-head
description: "Implicit trigger. The user never names the tool; a .jj folder next to .git and a detached HEAD in git status are the only signs that this is a Jujutsu repo, and asking for a commit and a branch must route to jj rather than to git commands."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

A colleague set this checkout up for me. There's a .jj folder sitting next to .git, and `git status` says HEAD is detached. I just want to commit my edits to parser.py and get them onto a branch called fix-parser so I can open a review. What do I run?
