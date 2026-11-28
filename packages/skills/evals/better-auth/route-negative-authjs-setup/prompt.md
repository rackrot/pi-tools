---
name: route-negative-authjs-setup
description: "Near miss: the same job (handler, adapter, server-side session) in Auth.js / next-auth v5, which the skill excludes by name. No skill in this repo owns it."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm wiring up next-auth v5 (Auth.js) in a Next.js app router project with the GitHub provider and the Prisma adapter. where does the route handler go, which env vars does it expect, and how do I read the session in a server component? the repo isn't checked out here, so describe the files.
