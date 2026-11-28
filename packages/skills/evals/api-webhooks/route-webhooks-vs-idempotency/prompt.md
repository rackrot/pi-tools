---
name: route-webhooks-vs-idempotency
description: Designing outbound webhooks goes to api-webhooks, not api-idempotency.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We want to notify customers' servers when an invoice is paid or a subscription changes. Design our outbound webhooks: the event catalog, payloads, signing, retries, and what customers can see in a delivery log.
