---
name: value-boundary-vs-resource-policy
description: "Value case. references/iam-edge-cases.md 'Resource policies and permissions boundaries': in the same account a resource policy that names an IAM user ARN or a role session ARN is not limited by the permissions boundary, one that names the role ARN is. Correct answer is ALLOWED, DENIED, ALLOWED; a model without the skill usually says the boundary blocks all three or none."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I am trying to predict three S3 calls before we rely on permissions boundaries as a guardrail. There are no files for this, everything is below.

Everything is in one account, 111122223333. No SCPs, no session policies, no explicit Deny anywhere, no KMS, default bucket settings. The IAM user `dana` and the IAM role `app` each have an identity policy that allows `s3:*` on `*`, and each has a permissions boundary that allows only `ec2:*` on `*` (so the boundary does not mention S3 at all).

Each case uses a different bucket whose bucket policy has a single Allow of `s3:GetObject` on the bucket's objects for exactly one principal:

- Case 1: the bucket policy principal is `arn:aws:iam::111122223333:user/dana`. `dana` calls GetObject with her own user credentials.
- Case 2: the bucket policy principal is `arn:aws:iam::111122223333:role/app`. A session of role `app` named `batch-7` calls GetObject.
- Case 3: the bucket policy principal is `arn:aws:sts::111122223333:assumed-role/app/batch-7`. That same session calls GetObject.

For each case, is the call allowed or denied? Explain briefly, then finish with exactly one last line in this format, nothing after it:

RESULT: 1=<ALLOWED|DENIED> 2=<ALLOWED|DENIED> 3=<ALLOWED|DENIED>
