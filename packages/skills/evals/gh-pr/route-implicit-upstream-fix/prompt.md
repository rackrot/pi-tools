---
name: route-implicit-upstream-fix
description: Implicit trigger. Getting a local fix into someone else's GitHub project, with no mention of a pull request, should read gh-pr.
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I found a crash in an open source library we depend on, github.com/tokio-rs/axum, and fixed it in my local clone. The fix is committed on a branch called fix/empty-header-panic. I've never contributed to that project and I can't push to it. How do I get the fix to the maintainers so they take it? Walk me through it, I'll run the commands myself.
