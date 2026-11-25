---
name: route-keys-vs-auth
description: Issuing and storing customer API keys goes to api-oauth-provider, not app-auth, if installed.
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
model: claude-sonnet-5-5
---

We are building API-key issuance for our public API so customers can call it from their servers. Should this be API keys or OAuth, and how do we hash and store the keys and look them up on each request?
