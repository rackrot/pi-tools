---
type: regex
pattern: '^[\s>*`-]*NEXT_PR[\s*`]*:[\s*`<]*gh-pr-create\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 2
target: last_message
---
