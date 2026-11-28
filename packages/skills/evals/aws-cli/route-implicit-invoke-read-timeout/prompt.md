---
name: route-implicit-invoke-read-timeout
description: Implicit trigger. A long Lambda invoke from a cron script fails with a read timeout and the function runs several times; no mention of CLI options, retries or the skill's wording.
tags: [routing]
runs: 3
max_turns: 5
allowed_tools: [Read, Glob, Grep, Skill]
---

our nightly cron runs `aws lambda invoke --function-name nightly-export --region eu-west-1 out.json`. The export takes about four minutes. Since last week the job dies after a minute or so with "Read timeout on endpoint URL", and in the function's logs I can see the export started three or four times for that one cron run. Nothing changed in the function. What is going on and what should the line in the script look like?
