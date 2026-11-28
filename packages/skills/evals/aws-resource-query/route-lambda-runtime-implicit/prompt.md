---
name: route-lambda-runtime-implicit
description: Implicit trigger. The current runtime and memory of a deployed function is a live-resource question, with no mention of AWS, the CLI, a profile or a region.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

is the nightly-export lambda in staging still on python3.9? and how much memory does it have right now
