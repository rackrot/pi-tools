---
name: route-implicit-off-switch-without-deploy
description: "Routing, implicit. Wanting to fall back to the old code path in production without a revert or redeploy, with no mention of flags, toggles or any vendor, routes to feature-flags. The code is pasted so the empty workspace does not matter."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the rewritten invoice PDF renderer goes out with tomorrow's release and I don't fully trust it yet. if it starts producing broken PDFs at 2am I want on-call to be able to fall back to the old renderer in production straight away, without a revert and a redeploy. what's the least invasive way to build that in? there is no repo checked out here, this is the function:

```ts
// src/billing/render.ts
import { renderLegacy } from './render-legacy';
import { renderV2 } from './render-v2';

export async function renderInvoicePdf(invoice: Invoice): Promise<Buffer> {
  return renderV2(invoice);
}
```
