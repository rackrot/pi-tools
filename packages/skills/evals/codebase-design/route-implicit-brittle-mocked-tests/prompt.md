---
name: route-implicit-brittle-mocked-tests
description: "Routing, implicit. A complaint about tests that need six mocks and break on private renames, with code that constructs its own dependencies and mutates its input, routes to codebase-design without naming design, modules or testability."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

every test we have for checkout needs six mocks and half of them break whenever someone renames a private helper. this is the function they all go through:

```ts
export async function checkout(cart: Cart): Promise<void> {
  const gateway = new StripeGateway(process.env.STRIPE_KEY!);
  const stock = new InventoryClient(process.env.INVENTORY_URL!);
  const db = getDb();
  applyDiscounts(cart);            // mutates cart.lines and cart.total
  await reserveLines(stock, cart); // exported only so tests can spy on it
  const charge = await gateway.charge(cart.total, cart.customerId);
  await db.insert(orders).values(toOrderRow(cart, charge));
  await sendReceipt(cart, charge);
}
```

what should change about how this code is put together so the tests stop being this painful? I don't want another round of patching the mocks.
