---
name: route-negative-pinia-destructured-badge
description: "Near miss: a Vue cart-count badge never updates because the store is destructured without storeToRefs. A single construct, no ordered handler sequence; belongs to vue."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

my cart badge in the header never updates when I add items. in the component I wrote `const { count } = useCartStore()` and the template shows `{{ count }}`. the store's `add()` action does increment `count` (I checked in devtools), but the badge stays at 0 until I reload. why, and what is the fix?
