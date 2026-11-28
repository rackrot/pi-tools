---
name: route-implicit-pre-launch-stack
description: "Routing, implicit. A pasted Terraform summary of an AWS workload with a request for weak spots and waste, without the words Well-Architected, pillar, audit or review, routes to aws-well-architected."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we inherited the bookings service from a contractor and the CTO wants to know how solid the AWS setup is and whether we're paying for stuff we don't need. I don't have account access yet, only the Terraform. this is what it defines, all in eu-west-1:

- one `aws_instance` m5.4xlarge running the API, in a public subnet, security group allows 22 and 443 from 0.0.0.0/0
- `aws_db_instance` postgres db.r5.2xlarge, `multi_az = false`, `backup_retention_period = 0`, `storage_encrypted = false`
- an S3 bucket for customer uploads, no versioning, no lifecycle rules, no public access block
- three NAT gateways, one per AZ, although the only instance is in a public subnet
- 12 `aws_ebs_volume` resources of type gp2, 500 GB each
- no alarms, no CloudTrail, the DB password is a literal in `variables.tf`

what would you flag, and in what order should we deal with it?
