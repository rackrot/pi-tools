---
type: regex
pattern: '^[\s>*\-`]*STRIPE_SECRET_KEY`?\**\s*:\s*[*`]*\s*OK\b'
flags: im
weight: 1
target: last_message
---
