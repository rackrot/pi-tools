---
name: route-implicit-pod-oomkilled
description: "Implicit trigger: a Go service that keeps getting OOMKilled under a container memory limit, with no mention of profiling, benchmarks or GC settings."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our order-export worker (Go, runs as a k8s deployment with a 1Gi memory limit) gets OOMKilled a couple of times a day when a big export comes through. between exports it sits around 300MB. I don't want to just bump the limit again. where do I start?
