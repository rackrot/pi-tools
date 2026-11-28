---
name: route-implicit-keyboard-complaint
description: "Routing, implicit. A user complaint about a sticky header hiding focus and a drag-only list, with a request for what else would not comply, routes to accessibility-review without the words audit, a11y or WCAG."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

a customer who navigates with the keyboard only wrote in about our settings page: when she tabs down the form the sticky header covers the field she's on, and the "reorder your dashboard widgets" list can only be rearranged by dragging. procurement on their side is now asking whether the page meets the standard public-sector buyers require. go through the page as described below and list everything that would not comply, not just her two complaints.

- sticky header, 72px tall, always on top
- form fields with a 1px #D0D0D0 border on white, labels in #9A9A9A
- save confirmation appears as a green toast for 3 seconds, no text change elsewhere
- widget list: drag handle only, no buttons or menu
- sign-in for this page asks for a 6-digit code from email and pasting into the code field is blocked
