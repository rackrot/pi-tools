---
name: route-explicit-benchmark-profile
description: A Go benchmark and profiling request routes to golang-performance.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

My Go JSON ingest endpoint got slower after a refactor. I have a benchmark, `BenchmarkIngest`, and a CPU profile from production. How do I compare before and after properly, read the profile, and tell whether my fix is a real speedup rather than noise?
