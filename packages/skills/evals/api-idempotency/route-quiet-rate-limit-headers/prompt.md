---
name: route-quiet-rate-limit-headers
description: Near miss. Rate-limit headers and the 429 error body are API contract design (api-rest-design), not idempotency keys or client retry policy, even though 429 and Retry-After appear in both.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We're adding per-customer rate limits to our public REST API. Which headers should every response carry so clients can see their remaining quota, and what should the 429 response body look like? We want the error format to follow RFC 9457.
