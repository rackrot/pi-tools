---
name: route-negative-live-rds-inventory
description: "Near miss: asking what RDS instances exist in a live account and how they are configured belongs to aws-resource-query, not to a Terraform change or plan review."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

which of our RDS instances in the prod account (eu-central-1) are still on Postgres 14, and is any of them publicly accessible? I'm signed in with the prod-readonly SSO profile, so just look it up in the account.
