---
name: route-negative-label-one-issue
description: "Near miss. Putting existing labels and a milestone on one GitHub issue is gh-issues work, not a repo label taxonomy; gh-repo-setup must not be read."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

issue 214 in acme/widgets on github is the crash on empty config. put the bug and P1 labels on it, move it into the 2.4 milestone and assign it to me. gh is logged in.
