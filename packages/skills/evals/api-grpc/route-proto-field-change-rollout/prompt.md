---
name: route-proto-field-change-rollout
description: "Positive trigger: a field rename plus type change in a .proto with old clients still deployed routes to api-grpc."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

In payments/v1/charge.proto I renamed `amount` to `amount_cents` and switched it from int32 to int64, same field number. The iOS app on the old build will be around for months. Can I merge this or does it need a staged rollout?
