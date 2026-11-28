---
name: route-remove-finished-flag
description: "Routing, boundary with flag-hygiene. Taking one finished flag out of the code belongs to feature-flags (section 4), not to the whole-codebase audit skill. The code is pasted so the empty workspace does not matter."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

`checkout-new-tax-engine` has been on for everyone in every environment since September and product confirmed the old tax engine is dead. take it out. there is no repo checked out here, these are the places it shows up, tell me what each one should look like afterwards and what else I have to do:

```ts
// src/flags.ts
export const NEW_TAX_ENGINE = 'checkout-new-tax-engine';

// src/checkout/tax.ts
export async function calcTax(cart: Cart, ctx: EvalContext): Promise<Money> {
  if (await flags.getBooleanValue(NEW_TAX_ENGINE, false, ctx)) {
    return taxEngineV2(cart);
  }
  return legacyTax(cart);
}

// src/checkout/tax.test.ts
describe('calcTax', () => {
  it('uses the legacy engine when checkout-new-tax-engine is off', async () => { /* ... */ });
  it('uses engine v2 when checkout-new-tax-engine is on', async () => { /* ... */ });
});
```
