---
name: route-implicit-work-gone-after-reset
description: "Routing, implicit. Committed work that vanished after a mistyped reset, with no mention of reflog, recovery or history, routes to git-history."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I think I just destroyed my afternoon. I was on payments-retry, meant to throw away one experimental file and typed `git reset --hard origin/main` instead. the four commits I made since lunch aren't in `git log` anymore and I never pushed them. the terminal I did it in is still open. is there anything that can be done, and what should I NOT touch in the meantime?
