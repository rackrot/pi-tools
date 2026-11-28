---
name: route-review-invoice-lock
description: "Routing. A review request for a lock around an invoice batch, written with ioredis SET NX EX and a bare DEL; routes to redis."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

can you look at this before I merge it? two of our cron pods sometimes both send the monthly invoice batch for the same customer, so I added a lock. this is the whole change, the repo isn't checked out here:

```ts
// src/billing/sendInvoices.ts
import { redis } from "../lib/redis"; // ioredis, one primary + one replica behind sentinel

export async function sendInvoices(customerId: string) {
  const key = `lock:invoices:${customerId}`;
  const got = await redis.set(key, "1", "EX", 30, "NX");
  if (!got) return;
  const invoices = await buildInvoices(customerId); // 5-40s depending on the customer
  await chargeAndEmail(invoices);
  await redis.del(key);
}
```
