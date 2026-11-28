---
name: route-negative-git-reflog-recovery
description: "Near miss. Undoing a bad rebase in a plain Git repo with the reflog belongs to git-history; jj must stay quiet even though undo and rebase are its vocabulary."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I botched an interactive rebase on my feature branch in git and force-moved the branch by accident. Use the reflog to work out where the branch was before and tell me how to get it back.
