---
type: regex
pattern: '^[\s>*`-]*START_PUSHES[\s*`]*:[\s*`<]*yes\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 1
target: last_message
---
