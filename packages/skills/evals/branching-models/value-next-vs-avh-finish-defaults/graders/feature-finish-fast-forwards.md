---
type: regex
pattern: '^[\s>*`-]*FEATURE_FINISH[\s*`]*:[\s*`<]*fast-forward\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 1
target: last_message
---
