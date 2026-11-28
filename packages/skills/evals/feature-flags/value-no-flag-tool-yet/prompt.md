---
name: value-no-flag-tool-yet
description: "Value case. A repo with no flag tool at all. The skill default is OpenFeature in code with a local provider (flagd file, in-memory or env var), suggested and not installed; the bare model is expected to name a vendor SDK or a home-grown env check."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our Express API (TypeScript, about 40 routes, one Postgres) has no feature flag library and no flag code anywhere, I checked package.json and grepped. I want to merge the new `/v2/export` endpoint switched off and later turn it on tenant by tenant.

what should the code in the route handler call to check the flag? one recommendation, not a comparison.

end your reply with exactly one line in the form `FLAG API: <name of the library, standard or approach>`.
