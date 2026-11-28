---
name: route-negative-dedupe-received-events
description: "Near miss. Storing received event IDs and claiming them atomically so a redelivered event is processed once belongs to api-idempotency (both skills say so); signature verification already works, so api-webhooks should stay quiet."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our CI service takes GitHub push events and starts a build for each. signature verification works and we already answer 202 right away and do the work in a job. the problem: every so often GitHub redelivers an event (same `X-GitHub-Delivery` id) and we start two builds, and twice both copies arrived within a few milliseconds of each other and both got past our `SELECT ... WHERE delivery_id = ?` check. how should the table and the claim look in Postgres so only one of them runs, and how long do we keep the ids?
