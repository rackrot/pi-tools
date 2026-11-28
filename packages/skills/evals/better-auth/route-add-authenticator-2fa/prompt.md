---
name: route-add-authenticator-2fa
description: "Routing, explicit. Adding authenticator-app two-factor to an app that already signs in with better-auth routes to better-auth."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our Next 15 app already does email + password sign-in through better-auth 1.7 with drizzle on postgres. security wants authenticator-app codes with backup codes as a second step before the end of the sprint. the repo isn't checked out in this session, so just tell me what has to change on the server, on the client and in the database, and what tends to go wrong.
