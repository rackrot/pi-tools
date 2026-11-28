---
name: experiment-loop-vs-problem-solving
description: "Routing, positive. A list of speed-up ideas to be tried one after another against a benchmark target without supervision routes to experiment-loop, not to a one-off optimization. Rewritten: the earlier prompt repeated the skill description (dedicated branch, commit or revert, results log)."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our `make bench` reports the p50 time of the parser in ns/op, currently around 520, and I want it under 400. I have a list of maybe 30 things that might help (a lookup table for whitespace, no regex in the number path, interning keys, and so on) and I don't want to babysit this: go through ideas on your own, one at a time, timing each, and I only want the ones that really help to survive. Cap it at 30 attempts. Before you start, tell me what you need from me.
