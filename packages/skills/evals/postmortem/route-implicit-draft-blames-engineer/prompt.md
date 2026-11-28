---
name: route-implicit-draft-blames-engineer
description: "Routing, implicit. A pasted incident report draft that blames a person and has vague follow-ups, with a request to check it before it goes to leadership, routes to postmortem without naming the document type."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

this goes to the VP tomorrow morning, can you look it over and tell me what to change? something about it reads off to me but I can't say what.

> **Search downtime, 12 May**
> Search was unavailable for 1h 20m on Monday afternoon. Marek ran the reindex script against production instead of staging because he didn't double-check which cluster his terminal was pointed at. Customers including Halvorsen Logistics complained to support.
> Cause: human error.
> Next steps: the team will be more careful with production access. We will improve monitoring. Marek will redo the production access training.
