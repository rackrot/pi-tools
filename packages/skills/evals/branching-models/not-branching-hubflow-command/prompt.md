---
name: not-branching-hubflow-command
description: Hard negative. A git hf question in a HubFlow repo belongs to hubflow and must not load the branching-model skill.
tags: [routing]
runs: 3
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

this old repo has a [hubflow] section in .git/config and the team keeps saying "just run git hf release finish 2.6.0". what does that actually do, and is it safe to run from my laptop right now?
