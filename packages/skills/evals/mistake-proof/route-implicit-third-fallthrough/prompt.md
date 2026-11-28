---
name: route-implicit-third-fallthrough
description: "Implicit trigger: a bug class that keeps coming back after one-off fixes, asked as 'what do we change so there is no fourth time', should load mistake-proof."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

third time this year: someone adds a new order status and billing quietly skips those orders, nobody notices until finance complains weeks later. each time we patched the one status by hand. I don't want a fourth. what do we change so adding a status can't go wrong like this again? the code is basically this, there are four more switches like it in shipping, emails, reports and the admin UI:

```ts
type OrderStatus = string; // "pending" | "paid" | "shipped" | "refunded" | "on_hold"

function invoiceAction(status: OrderStatus): "invoice" | "credit" | "none" {
  switch (status) {
    case "paid":
    case "shipped":
      return "invoice";
    case "refunded":
      return "credit";
    default:
      return "none";
  }
}
```
