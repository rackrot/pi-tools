---
name: value-no-json-from-memory
description: "Value case. With no export and no metric names, the answer asks for them (or labels assumptions) instead of handing over a complete dashboard JSON built from invented metrics."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

give me the dashboard JSON for checkout-api so I can import it
