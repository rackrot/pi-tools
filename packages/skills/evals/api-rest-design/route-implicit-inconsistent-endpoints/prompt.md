---
name: route-implicit-inconsistent-endpoints
description: "Routing, implicit. Integrator complaints about endpoints that disagree on failure bodies, status codes, paging parameters and field casing route to api-rest-design without the words REST, contract, design, review or RFC 9457."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

two integrators complained this week that our endpoints all behave differently, and they're right. this is what the backend does today:

- `GET /getOrders?page=2&size=50` returns `{ "orders": [...], "total": 912 }`
- `GET /customers?offset=50&limit=50` returns a bare JSON array
- `POST /orders` with a bad body returns 200 and `{ "success": false, "error": "invalid" }`
- `POST /customers` with a bad body returns 400 and `{ "message": "email is required", "code": 1004 }`
- orders have `created_at`, customers have `createdAt`
- `POST /orders/123/doCancel` returns 200 with an empty body

four more partners onboard next quarter. tell me what to change so this looks like one thing, and which of those changes will break the two integrators who are already live.
