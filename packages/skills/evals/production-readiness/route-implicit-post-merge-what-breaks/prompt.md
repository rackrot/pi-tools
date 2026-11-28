---
name: route-implicit-post-merge-what-breaks
description: Implicit trigger. A just-merged change about to deploy and a "what will bite us" question, with no readiness or review vocabulary, routes to production-readiness.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

merged the subscription billing PR into main an hour ago and the deploy train leaves at 16:00. what in here is going to bite us once real customers are on it? i'd rather hear it from you now than from the pager tonight
