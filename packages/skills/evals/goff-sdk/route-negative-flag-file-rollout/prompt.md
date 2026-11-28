---
name: route-negative-flag-file-rollout
description: Near-miss negative. Editing a rollout in a GOFF flag file belongs to goff-flags (or goff); no application code is touched, so goff-sdk should stay quiet.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

in flags/search.goff.yaml the flag `new-search` is on for 10% of users. change it to ramp from 10% to 100% between March 3 and March 17, and keep everyone at @acme.io on the new variation the whole time. show me the yaml.
