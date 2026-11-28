---
type: regex
pattern: '^[\s>*\-`]*(Problem|Solution)\**\s*:.*\b(components?|services?|boundar(y|ies)|APIs?|units?)\b'
flags: im
match: not_contains
weight: 1
target: last_message
---
