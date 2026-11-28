---
type: regex
pattern: '^[\s>*\-]*A\**\s*:\**\s*`?fj\s+pr\s+create\b(?!.*--draft)(?=.*WIP: Fix retry backoff overflow)'
flags: im
weight: 2
target: last_message
---
