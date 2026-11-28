---
name: route-negative-vendor-key-in-app
description: "Near miss: keeping another vendor's API key out of the browser bundle is consuming a key, not issuing one, so api-keys stays quiet."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our Vite app calls the OpenAI API straight from the browser and the key is in a VITE_ env var, so it ends up in the bundle. Where should the key live instead and what is the smallest change to stop shipping it to users?
