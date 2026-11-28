---
name: route-implicit-update-prs-on-forgejo
description: "Routing, implicit. Wanting automatic dependency update PRs on a self-hosted Forgejo, without naming the tool, routes to renovate."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we host our code on our own Forgejo. I'd like pull requests to be opened automatically whenever an npm package or a Docker base image we use gets a new release, the way GitHub does it for you. what do we need to run for that, and where does it run?
