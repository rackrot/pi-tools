---
name: route-negative-personal-data-inventory
description: "Near miss: where customers' personal data ends up, how long it is kept and whether it can be erased is the privacy-review skill's job, not an attacker-centred model of the system."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

launch review is next week and legal wants to know where our customers' emails, phone numbers and delivery addresses end up: which tables, which log lines, which third parties we send them to, how long we keep them, and whether we can delete one customer completely when they ask. the app is a django monolith with celery, sentry and segment. how would you go through it and what will the result look like?
