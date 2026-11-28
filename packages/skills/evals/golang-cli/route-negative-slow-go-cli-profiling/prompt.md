---
name: route-negative-slow-go-cli-profiling
description: "Near miss: a Go command-line tool that got slower between releases needs benchmark comparison and a CPU profile, which belongs to golang-performance, not to command tree or config wiring."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our Go command-line importer got slower between v1.4 and v1.5: `importer load big.csv` on the same 2 GB file went from about 40s to 65s and peak memory roughly doubled. nothing changed in the flags or commands, only the parsing code. how do I compare the two versions with benchmarks in a way I can trust, and get a CPU and allocation profile to see where the time goes?
