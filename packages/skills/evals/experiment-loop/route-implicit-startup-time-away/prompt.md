---
name: route-implicit-startup-time-away
description: "Routing, implicit, different wording. Someone going away wants the agent to try ideas to cut CLI startup time against a timing script and keep only what helps; no mention of loop, experiment, branch, overnight or log."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our CLI takes about 900 ms to start and I want that down. `./scripts/startup.sh` prints the median startup in ms on its last line. I'll be away from my desk for a few hours, so try ideas for reducing it on your own, one after another, and only keep the ones that actually lower the number. the test suite must still pass. when I'm back, show me what you tried. how will you approach this?
