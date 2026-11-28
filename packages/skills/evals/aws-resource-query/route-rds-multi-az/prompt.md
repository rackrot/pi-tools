---
name: route-rds-multi-az
description: A question about how live RDS instances are configured routes to aws-resource-query.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Which of our RDS databases in eu-west-1 are not Multi-AZ? Use the prod-readonly profile.
