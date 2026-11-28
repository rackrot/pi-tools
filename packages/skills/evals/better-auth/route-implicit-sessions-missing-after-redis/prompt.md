---
name: route-implicit-sessions-missing-after-redis
description: "Routing, implicit. A pasted betterAuth() config and a symptom (session table stays empty after adding a Redis block); the prose never names the library. Routes to better-auth through the config, not to redis or prisma."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

since last week's deploy the "active sessions" page in our admin panel shows nothing, and the `session` table in postgres has had no new rows since then. people can still log in fine. the only change in that deploy was the redis block below. what did we break and how do we get the rows back? the repo isn't checked out here, this is the whole file:

```ts
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { redis } from "./redis";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  secondaryStorage: {
    get: (key) => redis.get(key),
    set: (key, value, ttl) =>
      ttl ? redis.set(key, value, "EX", ttl) : redis.set(key, value),
    delete: async (key) => {
      await redis.del(key);
    },
  },
});
```
