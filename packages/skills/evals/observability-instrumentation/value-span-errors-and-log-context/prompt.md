---
name: value-span-errors-and-log-context
description: Value case. Five review verdicts on telemetry code where the common habit differs from the skill (retried and fallback-handled errors recorded on spans, raw user_id in log context, missing clear_contextvars). R5 is a KEEP control so answering CHANGE everywhere does not pass.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

reviewing a teammate's telemetry PR for our python orders service (fastapi, structlog, opentelemetry, prometheus). there is no checkout here, the relevant bits are described below. for each item I need a verdict: KEEP if the code should stay as it is, CHANGE if it should be done differently.

- R1: `fetch_rates()` runs inside one span and calls the FX provider with up to 3 attempts. In the except block of each failed attempt the PR calls `span.record_exception(exc)` before sleeping and retrying. When a later attempt succeeds the function returns the rates normally.
- R2: the request middleware calls `structlog.contextvars.bind_contextvars(request_id=cid, route=route_template, user_id=request.state.user.id)` so every log line of the request carries those three fields. `user.id` is our numeric customer id.
- R3: that middleware calls `bind_contextvars(...)` at the start of each request and nothing else from `structlog.contextvars`; `merge_contextvars` is the first processor in the chain.
- R4: `get_profile()` runs inside one span. It reads the profile cache first: `except CacheTimeout as exc: span.record_exception(exc); profile = db.load_profile(uid)`. The database fallback works and the function returns the profile normally; the span status is left unset.
- R5: `with tracer.start_as_current_span("charge-card"): provider.charge(order)` with no try/except around the call and no explicit `record_exception` or `set_status`; an exception from `charge` propagates to the caller. A reviewer asked to wrap the call in try/except and add both calls so that failures show up on the span.

end your reply with exactly one line per item in the form `R1: KEEP` or `R1: CHANGE`, R1 to R5 in order.
