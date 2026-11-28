---
name: route-negative-build-health-endpoint
description: Near-miss negative. Building a readiness endpoint and startup env validation shares the description's keywords (health checks, env validation) but asks for an implementation, not a ship verdict, so production-readiness must not fire.
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a `/readyz` endpoint to the orders worker that returns 503 until Postgres and Redis both answer, and make the process exit non-zero at startup when `DATABASE_URL` or `REDIS_URL` is missing. It is an Express app in TypeScript, the entry point is `src/server.ts`. Show me the code.
