---
name: route-negative-terraform-alarm
description: "Near miss: authoring a CloudWatch alarm as Terraform is infrastructure-as-code work (terraform), not an incident investigation, even though it names CloudWatch, an alarm and ALB 5xx."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We have no alerting on the public ALB yet. Write me the Terraform for a CloudWatch alarm that fires when target 5xx responses go above 1% of requests for 5 minutes straight and notifies our existing SNS topic (I'll pass its ARN in as a variable). Nothing is broken right now, I just want the resource block to drop into our alb module.
