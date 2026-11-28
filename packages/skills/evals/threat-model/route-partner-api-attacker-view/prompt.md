---
name: route-partner-api-attacker-view
description: "Routing, explicit intent in user words. A request for a written attacker's view of a service before it is opened to partners (who can reach what, where trust changes, what an outsider can use) routes to threat-model without the words threat model or STRIDE."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we open the orders API to outside partners next month. before that I want a written picture of how someone could attack this thing as it is built today: who can reach which component, where the level of trust changes between the gateway, the API, the export worker and postgres, and which weaknesses somebody with no account at all could actually use versus ones that need a login first. it's a go service behind an nginx ingress on kubernetes, redis for sessions, the worker pulls jobs from a rabbitmq queue and writes CSVs to an S3 bucket. tell me how you would go about it and what the write-up will contain.
