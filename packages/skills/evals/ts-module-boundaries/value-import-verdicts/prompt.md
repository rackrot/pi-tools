---
name: value-import-verdicts
description: Value case. The slash command loads the manual skill (pi expands /skill:ts-module-boundaries inline; the bare arm sees it as plain text). Seven imports to judge against the five rules; ground truth was produced by running dependency-cruiser 18.9 with the skill's config on these exact files. The bare model knows "no deep imports" but not that a test may not import its own package's internals (1), that any root file is an entry point, not only index.ts (2), or that a nested folder's index.ts is not an entry point because packages are flat (6). Items 3, 4, 5 and 7 are controls the bare model gets right.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:ts-module-boundaries is already set up in our repo exactly as the skill writes it (packages root `src/packages`, the unmodified config, `lint:boundaries` runs `depcruise src`). I can't run anything in this session and there are no files to open. For each import below, tell me whether `lint:boundaries` reports it as an error.

1. `src/packages/billing/tests/charge.test.ts` has `import { charge } from "../lib/charge";`
2. `src/packages/auth/lib/login.ts` has `import { client } from "../../billing/client";` (the file is `src/packages/billing/client.ts`)
3. `src/packages/billing/lib/charge.ts` has `import { rate } from "./tax/rate";`
4. `src/packages/billing/lib/seed.ts` has `import { invoice } from "../tests/fixtures/invoice";`
5. `src/app/main.ts` has `import type { Session } from "../packages/auth/lib/session";`
6. `src/packages/auth/lib/login.ts` has `import { issueInvoice } from "../../billing/invoicing";` (it resolves to `src/packages/billing/invoicing/index.ts`)
7. `src/packages/billing/tests/charge.test.ts` has `import { invoice } from "./fixtures/invoice";`

End your reply with exactly seven lines, 1 to 7 in order, in the form `1: ERROR` or `1: OK`.
