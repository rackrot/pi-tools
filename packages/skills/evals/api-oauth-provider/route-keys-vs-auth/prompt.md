---
name: route-keys-vs-auth
description: "Near miss. Choosing keys versus OAuth and hashing issued API keys belongs to api-keys, so api-oauth-provider must stay quiet."
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
model: claude-sonnet-5-5
---

We are building API-key issuance for our public API so customers can call it from their servers. Should this be API keys or OAuth, and how do we hash and store the keys and look them up on each request?
