---
name: value-open-design-decisions
description: Value case. Six either-or decisions left open in an Idempotency-Key and SDK retry design, each with one answer the skill states outright. A bare model tends to pick the cautious-sounding option - rejecting a key that returns after the replay window instead of running it as a new request, equal jitter over full jitter, a random UUID over an event-derived key, treating 408 and the in-progress 409 as non-retryable client errors, and replaying only status and body.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Customers sometimes get charged twice when our app retries POST /payments after a timeout, so we're adding an Idempotency-Key header and updating our SDK to go with it. Postgres is the database, and replays are honored for 24 hours. The design meeting left these open and I need them settled. Pick one option for each.

- Q1. A key shows up again 30 hours after it was first used: (A) process it as a brand-new request, or (B) reject it with a 4xx saying the key has expired?
- Q2. Backoff between SDK attempts: (A) exponential with equal jitter (half the delay fixed, half random), or (B) exponential with full jitter (random between zero and the capped delay)?
- Q3. Which key do our docs recommend to integrators first: (A) a random UUIDv4 generated once per call and reused across its retries, or (B) a key derived from the business event, like `order-confirm-<orderId>`?
- Q4. The SDK gets our 409 `idempotency_request_in_progress` because the first attempt is still running: (A) back off and send the request again with the same key, or (B) stop and raise the error to the caller, as for any other 4xx?
- Q5. What we store per key for replays: (A) the status code and the JSON body, or (B) the status code, the response headers and the body?
- Q6. The SDK gets a 408 from our gateway on a request that carried a key: (A) do not retry, it is a 4xx, or (B) retry with the same key?

A sentence of reasoning each is enough. End your reply with exactly one line per question in the form `Q1: A` or `Q1: B`, Q1 to Q6 in order.
