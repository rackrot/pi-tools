---
name: route-negative-app-side-login
description: Near miss. Adding "Sign in with GitHub" to our own app is the client side of OAuth (callback, state, session), not the issuer side, so api-oauth-provider must stay quiet.
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I want to add "Sign in with GitHub" to our Express app. Where do I handle the OAuth callback, how do I check the state parameter, and how should I keep the user's session after they come back from GitHub?
