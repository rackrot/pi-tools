---
name: route-negative-spend-last-month
description: "Near miss: asking what the account spent last month per service, with the exact Cost Explorer command, is a cost query (aws), not a workload review or a hunt for savings."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

what did we spend on AWS in March 2025, broken down per service? give me the exact aws cli command to pull that for profile `acme-billing`, and tell me how to read the output, the totals I got last time didn't match the invoice.
