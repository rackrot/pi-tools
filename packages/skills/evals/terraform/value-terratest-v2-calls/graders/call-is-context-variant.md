---
type: regex
pattern: '^[\s>*\-]*CALL\**\s*:\s*\**\s*`?(terraform\.)?InitAndPlan\w*Context\w*'
flags: im
weight: 1
target: last_message
---
