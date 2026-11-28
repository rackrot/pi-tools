---
name: route-double-order-implicit
description: Implicit trigger. Duplicate orders from double-clicks and timed-out requests route to api-idempotency without the words idempotency, key or retry policy.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We keep ending up with two identical orders in the database. It happens when someone double-clicks the Pay button, and also when the phone loses signal mid-request and the app sends POST /orders again. Support is refunding these by hand. How do we change the endpoint and the app so the same purchase can only ever go through once?
