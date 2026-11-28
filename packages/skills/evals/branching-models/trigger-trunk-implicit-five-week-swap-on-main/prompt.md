---
name: trigger-trunk-implicit-five-week-swap-on-main
description: "Implicit: a multi-week replacement in a repo with no long-lived branches and deploy-on-merge, which is branch by abstraction on trunk. No model name in the prompt."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

nobody on this team keeps a branch open longer than a day and main goes to prod on every merge. I have to replace our homegrown job queue with a library, roughly five weeks of work touching about 40 call sites. how do I land that in pieces without ever breaking main and without one giant PR at the end?
