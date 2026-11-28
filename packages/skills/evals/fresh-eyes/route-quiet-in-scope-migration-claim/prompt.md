---
name: route-quiet-in-scope-migration-claim
description: "In scope but manual: the user wants a claim knocked down by a reviewer who has not seen the session (the --disprove mode). fresh-eyes has disable-model-invocation, so it must not load on its own; the model-invocable sibling doubt-review owns this prompt. This fails if the flag is dropped without the case being turned into a positive trigger."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we've gone back and forth on this all afternoon and i've talked myself into it: dropping the `legacy_email` column in the same deploy as the code change is safe, because nothing reads it any more. before that stands i want somebody who wasn't part of this conversation to try to knock it down. there are no files to open, this is the whole migration:

```sql
ALTER TABLE users DROP COLUMN legacy_email;
```

and the deploy is a rolling one, old and new pods overlap for about two minutes.
