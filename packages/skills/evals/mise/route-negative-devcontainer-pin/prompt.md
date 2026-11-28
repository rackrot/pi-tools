---
name: route-negative-devcontainer-pin
description: "Near miss: pinning Node and Python versions through devcontainer features is tool-version pinning, but it belongs to devcontainer, not mise."
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

people on the team keep ending up with different Node and Python versions inside the dev container. this is our whole `.devcontainer/devcontainer.json`, there is no other config:

```json
{
  "name": "billing",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {},
    "ghcr.io/devcontainers/features/python:1": {}
  },
  "postCreateCommand": "npm ci"
}
```

change it so everyone gets Node 22.11 and Python 3.12 after a rebuild, and tell me what to run so an already-built container picks it up.
