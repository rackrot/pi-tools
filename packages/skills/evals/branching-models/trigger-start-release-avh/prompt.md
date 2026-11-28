---
name: trigger-start-release-avh
description: "Routing, explicit. Starting a release in a main + develop repo with the apt git-flow CLI routes to branching-models."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

develop has everything we want in 2.5.0 and QA wants a branch to test on from tomorrow. this repo was set up with `git flow init` years ago and I have the apt git-flow package on my machine. start the release for me and tell me what is allowed on that branch until it ships.
