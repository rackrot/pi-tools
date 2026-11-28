---
name: route-quiet-implicit-leak-worry
description: "In scope but manual, implicit: the user never says scan, audit or names a tool, only worries that a branch may carry a pasted key and a risky dependency bump. Must not load security-scan while disable-model-invocation is set; turn into a positive trigger (min 1) if the flag is dropped."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I rushed the payments-retry branch last night. pretty sure I pasted a live Stripe key into a config file at some point and took it out again a few commits later, and I bumped urllib3 and a couple of Go modules without looking at what changed in them. is any of that going to bite us if this gets merged today?
