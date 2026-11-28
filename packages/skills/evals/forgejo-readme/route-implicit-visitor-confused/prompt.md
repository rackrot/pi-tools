---
name: route-implicit-visitor-confused
description: "Implicit trigger: a visitor to a Codeberg repo cannot tell what the project is. No mention of a README; routes to forgejo-readme."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

someone on mastodon opened https://codeberg.org/acme/tidepool yesterday and told me they couldn't work out what the project even is or how to run it without digging through src/. it's a small self-hosted tide prediction service in Go, there's a Dockerfile and a .forgejo/workflows/ci.yml. can you sort out what people see when they open the repo?
