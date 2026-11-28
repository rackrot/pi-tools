---
name: route-implicit-passrole-statement
description: Implicit trigger. A pasted policy statement with a wildcard PassRole and a reviewer complaint, no "IAM" or "AccessDenied" keyword and no file to look for, should still open aws.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

security bounced my PR for our deploy pipeline's permissions, they say this statement lets the pipeline "become anything". there are no files to look at, this is all of it:

```json
{
  "Effect": "Allow",
  "Action": ["lambda:CreateFunction", "lambda:UpdateFunctionCode", "iam:PassRole"],
  "Resource": "*"
}
```

the pipeline only ever deploys functions that run as roles named app-*-exec in account 111122223333. what do they mean and what should the statement look like instead?
