---
name: route-negative-auth-library-session-store
description: "Near miss: which betterAuth() option moves session lookups to an existing Redis and whether the session table is still written is the better-auth skill's job (the redis skill excludes an auth library's secondary-storage settings)."
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our Next.js app uses better-auth with the prisma adapter, and every request does a session lookup in postgres. we already run a redis for other things. which option do I set in `betterAuth()` so the session lookups go there instead, and after I turn it on do sessions still get written to the `session` table or do I have to switch something else on for that? the repo isn't checked out here.
