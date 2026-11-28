---
name: route-nuxt-double-fetch-mismatch
description: "Routing, explicit symptom. A Nuxt page that requests its data twice and logs a hydration mismatch warning routes to vue; the prompt names Nuxt but not the skill or its wording."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our nuxt dashboard page hits /api/stats twice on every full page load (once in the server log, once in the browser network tab) and the console prints "Hydration completed but contains mismatches". the page is short:

```
<script setup lang="ts">
const stats = ref(await $fetch('/api/stats'))
const generatedAt = new Date().toLocaleTimeString()
</script>

<template>
  <section>
    <p>Generated at {{ generatedAt }}</p>
    <StatsGrid :stats="stats" />
  </section>
</template>
```

fix both problems, show me the corrected file.
