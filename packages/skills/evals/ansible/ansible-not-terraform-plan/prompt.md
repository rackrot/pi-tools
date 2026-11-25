---
name: ansible-not-terraform-plan
description: A Terraform plan and state question does not fire ansible.
tags: [routing, negative]
runs: 1
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

I renamed an `aws_s3_bucket` resource in our Terraform module and `terraform plan` now wants to destroy and recreate the bucket. How do I make the plan treat it as the same bucket without touching the real one?
