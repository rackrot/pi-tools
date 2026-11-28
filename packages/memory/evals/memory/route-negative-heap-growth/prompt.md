---
name: route-negative-heap-growth
description: "Near miss on the word memory: a process whose RAM grows until it is killed is a debugging task, not long-term notes."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our node worker's memory keeps growing, about 40 MB an hour, until the container gets OOM-killed around the 2 GB limit. it started after we added the in-process LRU for rendered templates. how do I find out what is holding on to the memory?
