---
name: sso-token-not-cli
description: Near-miss negative. An aws command fails, but the cause is an expired SSO session, which belongs to the aws skill (sign-in, SSO, expired tokens), not to aws-cli.
tags: [routing, negative]
runs: 3
max_turns: 5
allowed_tools: [Read, Glob, Grep, Skill]
---

every aws command I run this morning comes back with "Error loading SSO Token: Token for dev-admin does not exist", even plain `aws s3 ls --profile dev-admin`. It worked on Friday. How do I get back in?
