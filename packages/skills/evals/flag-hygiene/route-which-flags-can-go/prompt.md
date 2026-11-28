---
name: route-which-flags-can-go
description: "Routing, explicit. A whole-repo question about which of ~140 flags are dead, who owns them and what to delete first routes to flag-hygiene."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we've got something like 140 flags in the monorepo now, half in LaunchDarkly and half as env vars, and nobody can say which ones still do anything. before the Q3 planning I want to know which of them we can delete, in what order, and who has to sign off on each. how would you go about that and what would you hand me at the end?
