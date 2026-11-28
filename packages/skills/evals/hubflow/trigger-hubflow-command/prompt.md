---
name: trigger-hubflow-command
description: A question about what a git hf command does in a repo with a [hubflow] section routes to hubflow, which owns HubFlow.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

this old repo has a [hubflow] section in .git/config and the team keeps saying "just run git hf release finish 2.6.0". what does that actually do, and is it safe to run from my laptop right now?
