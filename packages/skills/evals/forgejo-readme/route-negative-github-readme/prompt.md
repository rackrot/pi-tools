---
name: route-negative-github-readme
description: "Near miss: a README header for a github.com repo belongs to readme, not forgejo-readme."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our repo is at github.com/acme/tidepool and the README still starts with a bare title. Give me a header for it: the logo from assets/logo.svg centred, one line on what it does (a self-hosted tide prediction service in Go) and a build status badge for .github/workflows/ci.yml.
