---
name: route-implicit-ready-for-agent
description: "Implicit trigger: judging whether one thin bug report is ready to hand to a coding agent or needs more from the reporter routes to gh-triage without the words triage or label."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Someone filed #212 on our GitHub repo (acme/storefront) saying uploads over 2 GB hang forever. No repro steps, just a screenshot of a spinner. Is that enough to hand to one of the coding agents, or what do I have to get out of the reporter first?
