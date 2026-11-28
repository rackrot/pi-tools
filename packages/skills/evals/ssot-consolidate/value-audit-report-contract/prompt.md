---
name: value-audit-report-contract
description: Value case. A retry policy pasted inline from four places. The report must classify each hit (exact copy, paraphrase, partial, stale, contradictory), give a per-hit action (dedupe, reference, reconcile) and ask for approval before editing; the bare model writes a free-form recommendation.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our retry policy is written down in four places and I want it in one. The repo is not checked out in this session, so here is every place it appears.

src/worker.ts
```
22  const MAX_ATTEMPTS = 5;
23  const BACKOFF_MS = 2000; // doubled on each attempt
```

.github/workflows/ci.yml
```
31        MAX_ATTEMPTS: 5
32        BACKOFF_MS: 2000
```

scripts/deploy.sh
```
 9  ./bin/worker --max-attempts 3 --backoff-ms 2000
```

README.md
```
52  Failed jobs are retried a handful of times with exponential backoff starting at two seconds.
53  Jobs that fail with a validation error are never retried.
```

Work out where it should live and what happens to the other places.
