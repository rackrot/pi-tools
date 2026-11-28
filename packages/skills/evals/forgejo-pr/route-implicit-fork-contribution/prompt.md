---
name: route-implicit-fork-contribution
description: Implicit trigger. A first contribution from a fork to an upstream project on Codeberg, with no mention of a pull request, should read forgejo-pr.
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I fixed the session timeout bug in a project that lives on codeberg.org. The fix is on fix/session-timeout in my fork. I've never contributed there before and I want the maintainers to look at it and take the change upstream. Help me submit it properly.
