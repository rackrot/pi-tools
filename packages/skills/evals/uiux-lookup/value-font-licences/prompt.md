---
name: value-font-licences
description: "Value case. Licence per Google Fonts family for a bundling notice. The bare model tends to answer OFL for the Apache-licensed families and for Ubuntu Sans, and Apache for the Roboto families that moved to OFL. Answers are in data/google-font-licenses.json and match the google/fonts repository directories (checked 2026-11)."
tags: [value]
runs: 3
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm writing the third-party notices file for a desktop app that bundles these Google Fonts families as files. which licence is each one distributed under on Google Fonts today?

- Roboto
- Roboto Mono
- Roboto Slab
- Kosugi Maru
- Syncopate
- Ubuntu Sans
- Inter

end your reply with exactly one line per family, in the order above, in the form `Family Name: LICENCE`, where LICENCE is one of `OFL`, `APACHE2` or `UFL`.
