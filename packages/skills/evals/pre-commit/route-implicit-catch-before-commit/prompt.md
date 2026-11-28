---
name: route-implicit-catch-before-commit
description: Implicit trigger. The user describes the symptom (formatting noise reaching review) and wants it caught locally before the change is recorded; no tool or hook is named.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

half our review comments are about trailing whitespace and files nobody ran the formatter on. I want that stuff caught on the dev's own machine the moment they try to record the change in git, so it never reaches a PR. python repo, we already use ruff. wire it up.
