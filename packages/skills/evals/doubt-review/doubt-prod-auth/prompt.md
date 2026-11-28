---
name: doubt-prod-auth
description: "Routing, implicit. A confident safety claim about a production auth change that is about to be committed, with no request for a review, routes to doubt-review."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

next up is committing the auth middleware change, it deploys to prod on merge. summary so you have it: session lookups are now cached in a process-local LRU keyed by the bearer token, and on a hit we skip the database completely. i'm pretty sure this is safe since tokens never change after they are issued and entries expire after 60 seconds. there are no files to open, this is the whole change:

```ts
const cache = new LRU<string, Session>({ max: 50_000, ttl: 60_000 });

export async function sessionFor(token: string): Promise<Session | null> {
  const hit = cache.get(token);
  if (hit) return hit;
  const session = await db.sessions.findByToken(token);
  if (session) cache.set(token, session);
  return session;
}
```

we run 12 API pods behind the load balancer. logout and "sign out everywhere" delete the row in db.sessions. ok to go ahead?
