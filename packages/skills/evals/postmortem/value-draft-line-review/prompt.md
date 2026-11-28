---
name: value-draft-line-review
description: "Value case. Eight lines of an incident write-up draft judged keep or fix. The rulings the bare model misses: an action owner must be a person, not a team (L5), and an action needs a priority (L6), both missed in every bare run; the timeline is in UTC even when the local zone is stated (L1), missed in most. The customer name and account ID in the impact (L2) and the four keep lines are controls the bare model usually gets right, so they carry weight 1."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

draft write-up for last Sunday's checkout incident, it gets published to the whole eng org on Thursday. I've pulled out the lines I'm unsure about. for each one tell me whether it can stay exactly as written (OK) or has to change before publishing (FIX). judge each line on its own, the rest of the doc is fine.

- L1 (timeline row): `05:10 CEST | first 5xx spike on checkout-api | grafana.internal/d/chk?from=1718507400`
- L2 (impact): "About 1,840 checkout attempts failed. The largest affected customer was Northwind Traders (account 44817); the full list is in the incident dashboard."
- L3 (root cause): "The migration tool accepts any kube context and does not check that the target cluster matches the change ticket."
- L4 (whys): "Why did checkout fail? The orders table was locked. Why was it locked? A staging migration ran on production. Why could it run there? The migration tool does not check the target cluster against the change ticket." The chain ends after these three whys.
- L5 (action 1): "Add a pre-flight check to the migration tool that aborts when the kube context does not match the ticket's cluster. Owner: Platform team. Due: 2024-07-05. Priority: P1."
- L6 (action 2): "Page on-call when checkout-api 5xx rate is above 2% for 5 minutes. Owner: Priya Raman. Due: 2024-06-28."
- L7 (where we got lucky): "The migration ran at 03:10 UTC on a Sunday, when traffic is about 5% of the weekday peak."
- L8 (contributing factor): "The rollback runbook was last reviewed 14 months ago and pointed at a decommissioned host."

end your reply with exactly one line per item in the form `L1: OK` or `L1: FIX`, L1 to L8 in order.
