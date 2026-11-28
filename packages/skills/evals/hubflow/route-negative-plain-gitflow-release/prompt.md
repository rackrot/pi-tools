---
name: route-negative-plain-gitflow-release
description: "Near miss: finishing a release with the AVH git flow CLI in a repo with [gitflow] config belongs to branching-models, which the hubflow description excludes."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

`git config --get-regexp '^gitflow\.'` shows gitflow.branch.master=main and gitflow.branch.develop=develop, and `git flow version` prints 1.12.3 (AVH Edition). release/1.8.0 is ready. Walk me through `git flow release finish 1.8.0`: what gets merged where, and do I have to push anything myself afterwards?
