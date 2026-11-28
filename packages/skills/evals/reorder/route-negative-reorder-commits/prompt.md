---
name: route-negative-reorder-commits
description: "Near miss on the word reorder: changing the order of commits on a branch is git-history's job, not a listing in a document."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

The last four commits on my feature branch are in the wrong order: the migration commit has to come before the two commits that use the new column, otherwise bisect breaks. Reorder them without changing what any of the commits contains.
