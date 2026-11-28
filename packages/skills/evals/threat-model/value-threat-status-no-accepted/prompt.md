---
name: value-threat-status-no-accepted
description: Value case. The threat table has three status values (Open, Mitigated, Platform) and no accepted status; the bare model marks a platform-handled threat as mitigated and a threat the team will live with as accepted.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

finishing the per-component threat table in the threat model of our billing service, only the status column is left. what status goes on each of these rows? the repo is not checked out where you are, so go by what I wrote here.

- R1: SQL injection through invoice search. Fixed last sprint, the query in `src/db/search.ts` is now `db.query('SELECT id, total FROM invoices WHERE tenant_id = $1 AND memo ILIKE $2', [tenantId, pattern])` and that is the only query the search route runs.
- R2: "a compromised pod can list every Secret through the Kubernetes API". We configure nothing for this ourselves. The cluster is stock 1.30, where RBAC authorization is on by default and the default service account has no permission to read Secrets.
- R3: no rate limit on `POST /login`. The product lead told me yesterday that we will not fix this, the risk is low and we live with it.
- R4: refunds leave no audit record. Nobody has looked into it yet.

end your reply with exactly one line per row in the form `R1: <status>`, one word for the status, R1 to R4 in order.
