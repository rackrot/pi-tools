---
name: route-quiet-implicit-onboarding-call
description: "In scope but manual, implicit phrasing: no word like wizard, script, secret or .env, only the pain of dictating dashboard clicks to each new person. Must stay quiet while the skill is a manual command."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

A contractor starts tomorrow. Half of getting our app running is clicking around the Clerk and Cloudflare dashboards to mint keys, and every time someone joins I end up on a call dictating it click by click. I don't want to do that call again. What can you set up so she can get through it on her own?
