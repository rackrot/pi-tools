---
name: value-audit-report-contract
description: "Value case. A free-form audit of a static mockup spec. Measures format, not WCAG knowledge: the report must follow the skill output contract (findings grouped by WCAG principle, the Critical/Major/Minor scale, a contrast table with computed and required ratios) and keep what the material cannot show in its own section. The bare model also does the last part, so that grader is lenient and low weight."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

please do an accessibility audit of our new invoice screen. all I have is the static Figma frame for the default state, values below, no prototype and no code yet.

- page background #FFFFFF, body text #8A8A8A at 14px regular
- "Send invoice" primary button: white label on #7FB3FF, 40px tall
- row icons (edit, duplicate, delete): 18x18 px, 4 px apart, icon only
- "Due date" field: no label above it, placeholder "dd/mm/yyyy" in #BDBDBD
- overdue invoices are marked only by the amount turning red (#E53935)
- line items are reordered with a drag handle
- a 64px sticky footer holds the totals and the "Send invoice" button
