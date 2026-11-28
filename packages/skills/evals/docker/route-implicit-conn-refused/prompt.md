---
name: route-implicit-conn-refused
description: "Routing, implicit: a service that cannot reach its database in a local container stack (no Docker or Compose named) should load docker."
tags: [routing]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

when i bring the stack up locally the api container dies on boot with `ECONNREFUSED 127.0.0.1:5432`. postgres is definitely running in its own container, i can connect to it from my laptop with psql on 5432 just fine. what's wrong and how do i fix it?
