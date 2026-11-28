---
name: route-implicit-blocked-and-parent
description: "Implicit trigger: a dependency and a parent link between tickets on a github.com repo, without the words issue, sub-issue or gh, routes to gh-issues."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

412 can't start until 398 has landed, and it really belongs under the payments epic (377). Can you record both of those on the tickets themselves so the board stops lying? Repo is github.com/acme/storefront.
