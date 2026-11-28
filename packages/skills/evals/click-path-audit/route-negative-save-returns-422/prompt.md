---
name: route-negative-save-returns-422
description: "Near miss: a Save button whose click handler runs correctly but the API rejects the payload shape. That is an API or data-shape bug, which the skill excludes; no handler sequence needs tracing."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

clicking Save on the profile form does fire the PATCH /api/profile request, I can see it in the network tab, but the API answers 422 with `{"errors":{"birth_date":["is required"]}}`. the form state has `birthDate: "1990-04-02"` and that is what gets sent. the backend is Rails and wants snake_case. where should the camelCase to snake_case mapping live, in the form, in the fetch wrapper or on the server, and what does the fetch wrapper version look like?
