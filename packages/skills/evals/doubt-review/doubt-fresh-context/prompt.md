---
name: doubt-fresh-context
description: "Routing, explicit. A non-obvious idempotence claim about a retry wrapper, with a request to have someone outside the session try to break it before the commit, routes to doubt-review. No skill name and no description wording."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

i'm about to commit the retry wrapper for the payments client. my argument for why a retry can never double-charge: every request carries a client-generated UUID and the server dedupes on it for 24 hours. i've been in this all afternoon and i no longer trust my own read of it. before it goes in, have a reviewer who has seen none of this conversation try to tear it apart. there are no files to open, this is all of it:

```ts
export async function chargeWithRetry(req: ChargeRequest, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const idempotencyKey = crypto.randomUUID();
    try {
      return await payments.charge({ ...req, idempotencyKey });
    } catch (err) {
      if (!isTransient(err)) throw err;
      await sleep(2 ** i * 200);
    }
  }
  throw new Error("charge failed after retries");
}
```

what it has to guarantee: at most one charge per call to chargeWithRetry, even when a response is lost after the server has already charged.
