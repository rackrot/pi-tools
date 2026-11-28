---
name: route-quiet-interactive-key-script
description: "In scope but manual, explicit phrasing: an interactive script that opens dashboards, takes keys with hidden input and writes .env. setup-wizard has disable-model-invocation, so it must not load on its own; this fails if that flag is dropped without the case being turned into a positive trigger."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

New devs keep getting stuck creating the Stripe and Resend keys for local dev. Give me an interactive script for it: it should open each dashboard page, tell them what to click and copy, take the keys without showing them on screen, and put them in .env.
