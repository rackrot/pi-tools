---
name: route-negative-quantile-query
description: "Near miss: a broken histogram_quantile expression that happens to sit in a Grafana panel is PromQL authoring and belongs to promql, not to grafana-dashboards."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the p99 panel on our Grafana latency board shows NaN whenever traffic is low. the query is `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[1m])) by (le))` and Prometheus scrapes every 60s. what is wrong with the expression and how should I rewrite it?
