---
name: route-negative-field-rename-breaking
description: "Routing, near-miss negative. Whether one JSON field rename on a REST endpoint is breaking and which version it needs belongs to api-rest-design; nothing is retired and no consumers are migrated, so deprecation-migration must stay quiet."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we want to rename the field `userName` to `username` in the JSON response of GET /users/{id}. is that a breaking change, and does it need a new API version or can it ship in the current one?
