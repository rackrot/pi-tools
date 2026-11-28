---
name: route-negative-production-dockerfile
description: "Near miss: a production Dockerfile and Compose stack with no dev container involved belongs to the docker skill, even though the wording (container, image size, npm ci caching, non-root user) overlaps."
tags: [routing]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

The image we ship for the API is 1.9 GB and every push re-runs `npm ci` from scratch in CI. The container also runs as root in production. Rewrite the Dockerfile as a multi-stage build with a cached dependency layer and a non-root user, and update compose.yaml so the api service waits for postgres to be healthy before it starts.
