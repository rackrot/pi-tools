---
name: route-implicit-stripe-signature-mismatch
description: "Routing, implicit, receiving side. A Stripe event handler that started failing signature checks after a body-parser change and times out on slow work routes to api-webhooks without the word webhook."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

since yesterday's deploy our billing service rejects every event Stripe sends us. the Stripe dashboard shows 400s for `invoice.paid` and our log says `No signatures found matching the expected signature for payload`. the only change in that deploy was moving `app.use(express.json())` to the top of server.js so every route gets it. separately, on big invoices the handler regenerates the PDF inline, takes about 40s, and Stripe marks those as timed out and sends them again. the repo is not checked out here. what's wrong, and how should this handler be structured?
