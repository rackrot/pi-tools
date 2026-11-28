---
type: regex
pattern: '^[\s>*\-`]*_SENTRY_DSN`?\**\s*:\s*[*`]*\s*REFUSED\b'
flags: im
weight: 2
target: last_message
---
