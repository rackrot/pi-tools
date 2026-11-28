---
name: value-risk-rating
description: "Value case. Findings of an AWS Well-Architected review rated with the skill's High/Medium/Low table: waste is Medium however large the amount, thin headroom is Medium, a single point of failure or missing backup is High, a best-practice deviation is Low. The bare model rates the large-waste findings High by dollar amount."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I finished collecting findings for the Well-Architected and cost review of our `ledger` workload on AWS (production, eu-central-1). please assign the risk rating to each finding so I can put them in the report.

- F1: three NAT gateways and an idle db.r5.8xlarge read replica that nothing connects to add up to about $7,400 a month, 38% of the workload's bill.
- F2: the production PostgreSQL instance has `multi_az = false`. automated backups are on with 14 days retention.
- F3: the Auto Scaling group for the API is at its max size of 6 every weekday afternoon with average CPU around 85%. no errors or timeouts so far.
- F4: 22 EBS data volumes are gp2 instead of gp3.
- F5: the DynamoDB table `ledger-entries` (the system of record) has point-in-time recovery off and no AWS Backup plan.
- F6: the `ledger-events` DynamoDB table is provisioned at 40,000 WCU and consumes at most 900. it is the largest line on the bill at about $9,800 a month and the CFO has escalated it twice.

end your reply with exactly one line per finding in the form `F1: HIGH`, `F1: MEDIUM` or `F1: LOW`, F1 to F6 in order.
