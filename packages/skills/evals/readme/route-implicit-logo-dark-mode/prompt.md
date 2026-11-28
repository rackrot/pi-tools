---
name: route-implicit-logo-dark-mode
description: "Routing, implicit. A logo that vanishes for GitHub dark-theme visitors at the top of the repo page. The README is never named; the fix (picture with prefers-color-scheme sources, or a self-painted SVG) is in readme (references/github.md)."
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

A user just told us our wordmark is basically invisible on github.com/acme/quillpack when they have GitHub set to the dark theme. It's black text on a transparent background, sitting above the project name on the repo page like this:

```html
<p align="center"><img src="assets/wordmark.svg" width="220"></p>
```

Design can give me a white version too. What do I change so both light and dark visitors see it? Give me the snippet.
