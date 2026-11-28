---
name: route-negative-promql-query-tuning
description: "Near miss: writing and fixing a PromQL query against metrics that already exist is the promql skill's job, not instrumentation of application code."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

this query returns nothing in prometheus and I can't see why:

histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{job="api"}[5m])) by (route)

the metric exists and has the labels job, route, le, instance. I want p99 per route across all instances. fix the query and tell me what was wrong with it.
