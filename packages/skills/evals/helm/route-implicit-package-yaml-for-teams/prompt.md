---
name: route-implicit-package-yaml-for-teams
description: Implicit trigger. Turning copy-pasted per-environment YAML into one versioned, parameterised package that other teams install from a registry is chart authoring and publishing, with Helm never named.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we have the same deployment, service and ingress yaml copy-pasted into dev/, staging/ and prod/ folders, and the only things that differ are the image tag, replica count and hostname. three other teams now want to run our service in their own clusters too. I want to turn this into one versioned package with a handful of documented knobs, push it to our GHCR org, and have them install a specific version with their own settings. how should I structure it and what are the steps to publish?
