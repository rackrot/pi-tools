---
name: route-negative-release-workflow-red
description: "Near miss: a failing Forgejo Actions job that happens to be the release workflow is forgejo-actions' job, not a manual release."
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I pushed tag v2.1.0 to our Forgejo (git.example.org/acme/widgets) and the publish job in .forgejo/workflows/release.yml went red straight away. the run page just says the job is waiting, then "no runner matched label ubuntu-latest-8-cores". what's wrong with the workflow and how do I fix it?
