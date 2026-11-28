---
name: route-implicit-slow-ecs-no-deploy
description: "Routing, implicit. A latency regression on an AWS-hosted service with no known deploy routes to aws-cloudwatch without the words CloudWatch, alarm, incident or CloudTrail."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

checkout got really slow about an hour ago, p99 went from ~300ms to 4s+ and some requests just hang. it's the checkout-api ECS service in us-east-1 behind the public load balancer. nobody admits to deploying anything today. aws profile is prod-ro (sso, I'm logged in). can you dig into what happened and tell me how you'd go about it step by step?
