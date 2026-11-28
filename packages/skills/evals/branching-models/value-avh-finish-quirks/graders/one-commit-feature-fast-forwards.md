---
type: regex
pattern: '^[\s>*`-]*ONE_COMMIT_FEATURE[\s*`]*:[\s*`<]*fast-forward\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 1
target: last_message
---
