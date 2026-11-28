---
type: regex
pattern: '^[\s>*\-`]*(Problem|Solution)\**\s*:.*\b(shallow|deep|deepen\w*|seams?|locality|leverage|modules?|interfaces?|adapters?)\b'
flags: im
weight: 2
target: last_message
---
