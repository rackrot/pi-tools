---
name: route-negative-gh-enterprise-login
description: "Near miss: the same not-logged-in complaint as forgejo-cli-auth-routing, but for gh against a GitHub Enterprise host. The skill description excludes github.com and GitHub Enterprise, so forgejo-cli must not be read."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

gh keeps saying I'm not logged in when I run `gh issue list` in our repo on ghe.acme-corp.com (our GitHub Enterprise Server). Get gh working against that host.
