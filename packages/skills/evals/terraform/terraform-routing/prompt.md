---
name: terraform-routing
description: Reviewing a count-to-for_each mass destroy/create plan routes to terraform:terraform.
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
model: claude-sonnet-5-5
---

Here is the output of `terraform plan` after I changed aws_instance.web from count to for_each: 3 to add, 0 to change, 3 to destroy (aws_instance.web[0], [1], [2] destroyed; aws_instance.web["a"], ["b"], ["c"] created). Review it and tell me whether it is safe to apply.
