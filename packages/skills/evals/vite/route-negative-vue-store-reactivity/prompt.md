---
name: route-negative-vue-store-reactivity
description: "Near miss: a Pinia store destructured in a component loses reactivity. The app is built with Vite and the prompt says so, but the bug is framework code and belongs to vue, not to build or dev-server config."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our Vue 3 app (Vite, Pinia) has a search page where the component does `const { filters, results } = useSearchStore()` in `<script setup>`. the template renders `results` once and then never updates when the store changes, although the devtools show the store state changing. it is not an HMR thing, it happens after a full reload and in the production build too. why does this happen and what is the right fix?
