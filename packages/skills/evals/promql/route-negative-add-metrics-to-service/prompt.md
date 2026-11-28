---
name: route-negative-add-metrics-to-service
description: "Near miss: adding a histogram and a counter to application code and choosing their labels is observability-instrumentation, not promql, even though the metrics end up in Prometheus."
tags: [routing]
runs: 1
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Our Express payments service exposes no metrics at all. Add a request duration histogram and an error counter with prom-client, and tell me which labels are safe to put on them. Customer id and the full URL path are what I would reach for first.
