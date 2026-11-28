---
name: route-implicit-holes-in-graph
description: "Implicit trigger: holes in a request-rate graph on a VictoriaMetrics backend while the service was up route to promql (data gaps). The prompt names neither PromQL nor Prometheus."
tags: [routing]
runs: 1
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

the request-rate graph for the billing service has holes in it every night between 02:00 and 02:20. the service logs show it was serving traffic the whole time, so I don't think it was down. metrics are in VictoriaMetrics, base URL is in $VM_URL. what do I run to find out where the samples went?
