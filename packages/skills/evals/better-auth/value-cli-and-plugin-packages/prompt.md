---
name: value-cli-and-plugin-packages
description: "Value case. Package names and the schema workflow for Better Auth 1.7: the CLI is the `auth` package (not @better-auth/cli), `migrate` works only with the built-in Kysely adapter, and the API-key and passkey plugins are separate @better-auth/* packages. A model answering from older releases gets the CLI and API-key packages wrong."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm writing the setup section of our internal docs for a new service on better-auth 1.7.10 with the Prisma adapter on postgres. the repo isn't checked out in this session. I need four facts, as they are for that version:

- A1: the npm package to add as a dev dependency so the Better Auth CLI (generate, migrate, ...) runs from node_modules instead of being fetched on each run. package name only, no version.
- A2: can that CLI's `migrate` command apply the schema to our database with the Prisma adapter? YES or NO.
- A3: the npm package the server-side API-key plugin is imported from. package name or import specifier only.
- A4: the npm package the server-side passkey plugin is imported from. package name or import specifier only.

end your reply with exactly four lines in the form `A1: <answer>`, A1 to A4 in order, nothing after them.
