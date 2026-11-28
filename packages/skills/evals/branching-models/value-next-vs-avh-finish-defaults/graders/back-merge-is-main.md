---
type: regex
pattern: '^[\s>*`-]*BACK_MERGE[\s*`]*:[\s*`<]*main\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 1
target: last_message
---
