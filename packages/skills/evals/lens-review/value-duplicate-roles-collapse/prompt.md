---
name: value-duplicate-roles-collapse
description: Value case, manual invocation. Six requested reviewers that cover only two failure modes must collapse to lenses (2 to 5, one per failure mode); the bare model runs all six.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:lens-review the rollout plan below. reviewers I want on it: security reviewer, senior security reviewer, principal security architect, performance engineer, staff performance engineer, senior performance engineer.

Plan: move session storage from signed cookies to a server-side table. Each request looks the session up by an opaque 128-bit id sent in an HttpOnly, Secure, SameSite=Lax cookie. The sessions table lives in the primary Postgres, indexed on id, with no cache in front of it. Sessions expire after 30 days and a nightly job deletes expired rows. Rollout is one deploy; existing signed cookies are accepted for 7 more days and converted on first use.

end your reply with exactly one line in the form `VERDICTS GIVEN: <number>`, the count of separate verdicts in your reply.
