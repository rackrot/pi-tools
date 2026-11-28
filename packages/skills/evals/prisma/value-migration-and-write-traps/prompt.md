---
name: value-migration-and-write-traps
description: Value case. Prisma 6 behaviours the bare model guesses wrong - @updatedAt on an update with empty data, the default load strategy once relationJoins is on, and migrate deploy only warning on an edited applied migration.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

reviewing a teammate's PR on our Prisma 6 service (postgres unless a claim says otherwise). i need a verdict on three claims from the PR description and the review thread. say TRUE or FALSE for each.

- C1: "Calling `prisma.user.update({ where: { id }, data: {} })` is a handy way to touch the row: it bumps the `@updatedAt` column."
- C2: "I turned on the `relationJoins` preview feature, but nothing changes for existing queries: `include` keeps sending one query per relation unless a query passes `relationLoadStrategy: 'join'`."
- C3: "I fixed a typo in the SQL of a migration that production applied last month. `prisma migrate deploy` does not stop the release for that; it prints a warning and leaves the production table as it is."

end your reply with exactly one line per claim in the form `C1: TRUE` or `C1: FALSE`, C1 to C3 in order.
