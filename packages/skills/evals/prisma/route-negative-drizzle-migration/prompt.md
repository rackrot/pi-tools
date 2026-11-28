---
name: route-negative-drizzle-migration
description: "Near miss. A Drizzle ORM migration question is a TypeScript ORM task but not Prisma; the prisma skill must not be read."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we use drizzle-orm with postgres. i added a `nickname` column to `users` in src/db/schema.ts with `text("nickname").notNull()`. which drizzle-kit commands do i run to create and apply the migration, and will it fail on the rows that already exist?
