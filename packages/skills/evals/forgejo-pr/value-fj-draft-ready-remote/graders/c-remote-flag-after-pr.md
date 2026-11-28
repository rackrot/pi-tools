---
type: regex
pattern: '^[\s>*\-]*C\**\s*:\**\s*`?fj\s+pr\s+(-R|--remote)[ =]upstream\s+status\s+(12\s+--wait|--wait\s+12)\b'
flags: im
weight: 2
target: last_message
---
