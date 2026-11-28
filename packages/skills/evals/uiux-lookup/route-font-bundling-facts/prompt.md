---
name: route-font-bundling-facts
description: "Routing, explicit need. Licence, variable axes and subsets of named Google Fonts families are font facts the skill's dataset answers; no skill name or description wording."
tags: [routing]
runs: 3
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

we're shipping Kosugi Maru and Roboto Flex inside the installer of a commercial desktop app (font files bundled, not loaded from the CDN). legal wants to know which licence each one is under, and I need to know whether either has a variable weight axis and whether they cover Cyrillic. don't guess, I need what the catalogue actually says.
