---
name: route-negative-rest-v2-sunset
description: "Near miss: a /v2 and sunset schedule for a public REST API belongs to api-rest-design, which api-grpc names as out of scope."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We are cutting /v2 of our public REST API because the order resource changes shape. Write the policy for how long /v1 stays up, which headers announce the sunset, and how we tell integrators.
