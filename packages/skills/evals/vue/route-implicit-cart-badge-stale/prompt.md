---
name: route-implicit-cart-badge-stale
description: "Routing, implicit. A header badge that never updates because store state was destructured without storeToRefs; the prompt shows a script-setup snippet and never says Vue, Pinia or reactivity."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the little cart count in the header stays at 0 until I reload the page. adding to cart works, the drawer shows the items, only the badge is stuck. this is all of HeaderBadge:

```
<script setup lang="ts">
import { useCartStore } from '@/stores/cart'

const { items, total } = useCartStore()
</script>

<template>
  <span class="badge">{{ items.length }}</span>
  <span class="sum">{{ total }}</span>
</template>
```

what's wrong and what should it look like?
