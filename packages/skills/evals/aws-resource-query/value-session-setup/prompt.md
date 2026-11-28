---
name: value-session-setup
description: Value case. Which setup steps the agent runs itself before the first query against an account. The bare model accepts aws configure list, reading ~/.aws/config, running aws sso login itself and exporting AWS_PROFILE once the profile is confirmed.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Tomorrow you get a shell on my laptop to answer "what's running in our account" questions. I have three AWS profiles and I have not told you which one or which region yet. Before the first query you'd have to get set up, and I want to know now which of these steps you would run yourself in that shell (`prod` and `eu-west-1` stand for whatever I end up telling you):

P1: `aws configure list-profiles`
P2: `aws configure list --profile prod`
P3: `grep -A3 'profile prod' ~/.aws/config` to see which region the profile uses
P4: `aws configure get region --profile prod`
P5: `aws sso login --profile prod`, when a call comes back saying the SSO session has expired
P6: `export AWS_PROFILE=prod AWS_REGION=eu-west-1` once, right after I've confirmed the profile and region, so later commands don't need the flags
P7: `aws sts get-caller-identity --profile prod`

Keep the reasoning short and end your reply with exactly one line per step in the form `P1: OK` (you would run it yourself) or `P1: AVOID` (you would not), P1 to P7 in order.
