---
name: value-endpoint-response-actions
description: Value case. What an outbound webhook delivery worker does with six responses from a customer endpoint. Tests the skill's response classification (3xx is a failure and is never followed, 408 retries, 410 disables the endpoint, other 4xx go straight to the dead-letter queue); the bare model tends to follow the redirect, retry permanent 4xx or disable on 401/404.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

we're writing the delivery worker for the webhooks our API sends to customer endpoints. it signs and POSTs each event and retries on an exponential backoff schedule (10 attempts over about 3 days). the repo is not checked out here. I need the rule for what the worker does with each of the responses below when it gets one from a customer's endpoint. pick exactly one action per response:

- RETRY: count the attempt as failed and try again later on the schedule
- DEADLETTER: make no further attempts for this event and park it for inspection and replay
- DISABLE: turn the endpoint off so no further events are sent to it, and notify the customer
- FOLLOW: send the same request to the URL in the `Location` header

- O1: `301 Moved Permanently` with a `Location` header
- O2: `403 Forbidden`
- O3: `404 Not Found`
- O4: `408 Request Timeout`
- O5: `410 Gone`
- O6: `401 Unauthorized`

keep the reasoning short. end your reply with exactly one line per response in the form `O1: RETRY`, O1 to O6 in order.
