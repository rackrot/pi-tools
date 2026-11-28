---
name: route-negative-live-alarm-firing
description: "Near miss: an incident that is still going on (alarm firing, service erroring now, find what changed) belongs to aws-cloudwatch or plain debugging, not to the write-up after resolution."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our ALB 5xx alarm went off ten minutes ago and it's still firing, the orders service on ECS is throwing 503s for maybe a third of requests right now. I'm on call and alone. how do I find out what changed in the last hour and how far it has spread? give me the CloudWatch and CloudTrail queries to run first.
