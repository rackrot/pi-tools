---
name: route-implicit-parallel-work-from-chat
description: "Routing, implicit. Work agreed in conversation that three people should start on in parallel, tracked on GitHub, routes to issue-breakdown without the words issue, slice or breakdown."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

ok so we've settled it in this chat: invoices get a "send reminder" button, reminders go out through the existing mail queue, each one is recorded on the invoice timeline, and finance can switch reminders off per customer. three devs are free from Monday and I don't want them stepping on each other. get this onto our GitHub board (acme/billing) so each of them can grab a piece and it's clear what has to land first.
