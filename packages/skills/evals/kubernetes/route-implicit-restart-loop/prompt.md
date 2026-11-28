---
name: route-implicit-restart-loop
description: Implicit trigger. A service that restarts every few minutes after a deploy, with pasted pod status, is workload triage; Kubernetes, kubectl and the status names from the skill description are never written out.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

since yesterday's release the checkout service on the prod cluster keeps falling over every few minutes and coming back. I only have read access there. this is what I see, where do I look next and in what order?

```
NAME                        READY   STATUS    RESTARTS        AGE
checkout-7c9d8b6f5d-4xkqp   0/1     Running   14 (2m3s ago)   61m
checkout-7c9d8b6f5d-m2zvw   1/1     Running   13 (4m41s ago)  61m
checkout-7c9d8b6f5d-tq8rn   0/1     Running   14 (58s ago)    61m
```
