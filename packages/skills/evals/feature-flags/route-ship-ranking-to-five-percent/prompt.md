---
name: route-ship-ranking-to-five-percent
description: "Routing, explicit. Shipping a new code path to a slice of users with the LaunchDarkly client the repo already has, plus tests for both paths, routes to feature-flags. The code is pasted so the empty workspace does not matter."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the new ranking model is merged but product only wants 5% of logged-in users to get it for now, everyone else stays on the old scorer. we already have the LaunchDarkly node client, other code calls it like `await ld.variation('search-typeahead', { kind: 'user', key: user.id }, false)`. this is the function, there is no repo checked out here so just give me the changed code and the tests I need for both paths:

```ts
// src/recs/rank.ts
import { scoreV1 } from './score-v1';
import { scoreV2 } from './score-v2';

export async function rank(user: User, items: Item[]): Promise<Item[]> {
  const scored = items.map((item) => ({ item, score: scoreV1(user, item) }));
  return scored.sort((a, b) => b.score - a.score).map((s) => s.item);
}
```
