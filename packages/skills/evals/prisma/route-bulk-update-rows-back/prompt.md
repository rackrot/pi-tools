---
name: route-bulk-update-rows-back
description: "Routing, explicit. A user writing a Prisma bulk update who wants the changed rows back and worries about a missing filter value routes to prisma."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

in our express api (prisma + postgres) i'm adding an endpoint that marks every open invoice of a customer as void. right now i have

```ts
const voided = await prisma.invoice.updateMany({
  where: { customerId: req.body.customerId, status: "OPEN" },
  data: { status: "VOID" },
});
res.json(voided.map((i) => i.id));
```

typescript complains about `.map`. how do i get the invoices that were changed, and is there anything else wrong with this handler?
