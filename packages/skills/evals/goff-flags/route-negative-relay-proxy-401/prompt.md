---
name: route-negative-relay-proxy-401
description: Near-miss negative. A GO Feature Flag relay proxy auth and retriever problem belongs to the relay proxy skill (or the umbrella goff skill), not to the flag file skill.
tags: [routing]
max_turns: 5
allowed_tools: [Read, Glob, Grep, Skill]
---

our go-feature-flag relay proxy runs in k8s from the helm chart. since yesterday the node api gets 401 on every /ofrep/v1/evaluate/flags call even though it sends X-API-Key, and separately the proxy seems to take ages to pick up changes after we merge to the flags repo on github. the flags themselves are fine, they evaluate correctly when I hit the proxy from my laptop with the admin key. what should I check in goff-proxy.yaml?
