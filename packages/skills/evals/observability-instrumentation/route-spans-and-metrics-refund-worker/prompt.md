---
name: route-spans-and-metrics-refund-worker
description: "Routing, explicit. A request to add spans, a latency metric and trace ids in log lines to a worker routes to observability-instrumentation without naming the skill."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our refund worker (python, celery, calls the payment provider over http and retries up to 3 times) has zero telemetry right now. I want spans around the provider call, a latency metric per provider, and the trace id in every log line so I can jump from a log to the trace. we already run an otel collector and prometheus. tell me exactly what to add and which labels are safe to put on the metric. there is no code checked out here, just describe the changes.
