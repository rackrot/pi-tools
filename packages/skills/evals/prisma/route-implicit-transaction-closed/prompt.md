---
name: route-implicit-transaction-closed
description: "Routing, implicit. A pasted 'Transaction already closed' error and a $transaction callback that calls a payment API route to prisma without the user naming the ORM."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

checkout started failing under load on friday. the logs show

```
Transaction API error: Transaction already closed: A query cannot be executed on an expired transaction. The timeout for this transaction was 5000 ms, however 6218 ms passed since the start of the transaction.
```

the code is

```ts
await db.$transaction(async (tx) => {
  const order = await tx.order.create({ data: { userId, total } });
  const charge = await payments.charge(userId, total); // calls the payment provider over http
  await db.auditLog.create({ data: { orderId: order.id, event: "charged" } });
  await tx.order.update({ where: { id: order.id }, data: { chargeId: charge.id, status: "PAID" } });
});
```

what is going on and how should this be restructured?
