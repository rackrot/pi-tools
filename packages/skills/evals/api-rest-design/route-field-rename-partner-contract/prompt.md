---
name: route-field-rename-partner-contract
description: "Routing. A single field rename and type change on a partner-facing REST contract, asking whether it breaks clients, which version it needs and how long the notice window is, routes to api-rest-design rather than deprecation-migration."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our order API is used by about thirty partner integrations. we want to rename `total_price` to `amount` in the `GET /v1/orders/{id}` response and change it from a number to a string with two decimals. does that break the partners' clients? does it need a /v2, or can it stay in /v1? and how much notice do partners need before the old field goes away?
