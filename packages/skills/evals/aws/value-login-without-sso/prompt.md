---
name: value-login-without-sso
description: "Value case. SKILL.md 'Signing in' table: an IAM user without IAM Identity Center signs in with `aws login` (CLI 2.32.0 or later) and a permission error right after it means the SignInLocalDevelopmentAccess managed policy is missing. Haiku already knows the command and the version without the skill (weight 1 together); the policy name is what it does not know (weight 3)."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

A contractor joined us today. She has an IAM user with console access in our one AWS account. We do not use IAM Identity Center or any SSO, and security will not let anyone create long-lived access keys. She needs the AWS CLI v2 working on her own laptop today with short-lived credentials she gets by signing in through the browser. Nothing on this machine is hers, so there is nothing to inspect here.

Tell me what she should run, the oldest AWS CLI version that has that command, and which AWS managed policy our admin has to attach to her user if she gets a permission error straight after signing in.

Finish with exactly one last line in this format, nothing after it:

LOGIN: <the command> | MIN_CLI: <x.y.z> | POLICY: <managed policy name>
