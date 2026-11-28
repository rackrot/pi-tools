---
name: route-negative-sdk-provider-wiring
description: "Near miss. Wiring an OpenFeature provider into app code against an already working proxy belongs to goff-sdk (or the goff umbrella), not to relay proxy configuration."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our go-feature-flag proxy is already up at http://goff.internal:1031 and works fine, nothing to change there. what I need is the Next.js side: in the API route handlers under app/api/ I want to evaluate the `new-pricing` boolean flag for the logged-in user through OpenFeature, falling back to false when the proxy can't be reached. can you write the provider setup and one example handler?
