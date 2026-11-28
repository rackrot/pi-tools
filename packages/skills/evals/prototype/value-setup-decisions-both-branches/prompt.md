---
name: value-setup-decisions-both-branches
description: "Value case. Setup decisions for two prototypes in a Next.js + Prisma app, one per branch of the skill. Rules check: one self-contained HTML file, no framework, opened without a server, in-memory state, no tests. Page comparison: at most five options, on the existing route, selected by a ?variant= search parameter. The bare model adds a dev page backed by the staging database, builds all eight options and mounts them on a separate route."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Two prototypes I need before Friday in our Next.js + Prisma app. Both exist to settle a decision and neither is the implementation.

First, the subscription rules. Before I write the real lifecycle (trial, active, past_due, paused, canceled, plus proration when the plan changes mid-cycle) I want to walk through the transitions with our billing ops lead and find the cases where the rules feel wrong. The staging Postgres has realistic subscriptions we could use.

Second, the billing page. Design is split on it. The page exists today at /settings/billing and already loads the plan and the invoices on the server. The PM has asked for eight alternative takes on it that the team can compare in the browser; the losers get thrown away.

Don't build anything yet, the repo is not checked out in this session. Tell me how you would set each one up, then end your reply with exactly these eight lines:

FILES: <rules prototype: how many files you will create, one number>
FRAMEWORK: <rules prototype: NEXT, REACT or NONE>
START: <rules prototype: exactly what the ops lead does to get it on screen>
DATA: <rules prototype: STAGING_DB, SQLITE or MEMORY>
TESTS: <rules prototype: YES or NO, do you write unit tests for the transition logic as part of this>
COUNT: <billing page: how many alternatives you will build, one number>
PATH: <billing page: the URL path the team opens to see the alternatives, path only, no query string>
SELECT: <billing page: the exact URL or control that shows the second alternative>
