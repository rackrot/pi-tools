---
name: route-negative-reshape-module-interface
description: "Near miss: reshaping one module's interface so callers need fewer exports is design work (codebase-design), not installing an import-boundary check."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

src/packages/billing/index.ts exports 41 functions and callers have to call six of them in the right order to issue an invoice. Propose a smaller interface for the billing package that hides that sequencing, and say which exports can go.
