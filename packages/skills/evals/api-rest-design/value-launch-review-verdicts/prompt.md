---
name: value-launch-review-verdicts
description: "Value case. Six behaviours of an API about to go public judged ship-as-is or change: over-maximum page size must be rejected not clamped, Retry-After is emitted as delay-seconds not an HTTP-date, lengthening a documented-opaque ID is not a breaking change, the in-flight idempotency 409 is the one retryable 409, and two controls (repeat DELETE answering 404, an unpaginated small fixed list) are fine. The bare model tends to accept the clamp and the HTTP-date and to reject the ID change."
tags: [value]
runs: 3
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

our partner API goes public next month and I'm doing the last pass over it. for each behaviour below I need a verdict: fine to ship as it is, or change it before launch.

- V1: collections take `limit` with a default of 25 and a maximum of 100. A request with `limit=5000` gets a 200 with 100 items.
- V2: `DELETE /v1/orders/{id}` returns 204 the first time and 404 when the same call is repeated.
- V3: a throttled caller gets a 429 with `Retry-After: Wed, 21 Oct 2026 07:28:00 GMT` and a problem-details body.
- V4: `GET /v1/order-statuses` returns all nine possible statuses in one response, with no pagination.
- V5: order IDs are documented as opaque strings and the docs tell clients not to assume a length or format. Next year we plan to lengthen them from 12 to 26 characters inside /v1, announced in the changelog only, with no new version and no deprecation window.
- V6: every 409 carries `"retryable": false` in the body, except the 409 we send while an earlier request with the same `Idempotency-Key` is still being processed, which carries `"retryable": true`.

end your reply with exactly one line per behaviour in the form `V1: SHIP` or `V1: CHANGE`, V1 to V6 in order.
