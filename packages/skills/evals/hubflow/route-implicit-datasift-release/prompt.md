---
name: route-implicit-datasift-release
description: "Implicit trigger: a release in a repo described only as the DataSift flavour of gitflow with auto-pushed, PR-merged features; neither HubFlow nor git hf is named."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I inherited the invoicing service. The wiki says the team works with "the DataSift flavour of gitflow": master and develop, every feature branch gets pushed to origin automatically and goes in through a GitHub PR. Nobody who set it up is still here. I have to cut 4.1.0 this week. What do I run, and what happens on origin when I do?
