---
name: route-idempotency-vs-webhooks
description: Fixing duplicate charges from client retries goes to api-idempotency, not api-webhooks.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Customers sometimes get charged twice when our mobile app retries POST /payments after a timeout. We want to add an Idempotency-Key header. Design how the server stores and claims keys so concurrent retries can't both run, and what retry policy our SDK should use.
