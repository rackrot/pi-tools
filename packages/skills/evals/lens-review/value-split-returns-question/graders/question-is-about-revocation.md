---
type: regex
pattern: '^[\s>*\-`]*FINAL\**\s*:\s*\**\s*`?ASK\b.*(revo[ck]|stale|15|fifteen|TTL|propagat|take effect)'
flags: im
weight: 1
target: last_message
---
