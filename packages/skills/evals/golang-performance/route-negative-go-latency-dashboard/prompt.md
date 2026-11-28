---
name: route-negative-go-latency-dashboard
description: "Near miss: adding latency metrics, a dashboard and an alert to a Go service is production instrumentation (observability-instrumentation), not benchmark or profile work."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our Go HTTP API has no metrics at all. I want a request latency histogram per route exported for Prometheus, a Grafana dashboard with p50/p95/p99, and an alert when p99 goes over 500ms for 10 minutes. What should I add to the service and what should the alert rule look like?
