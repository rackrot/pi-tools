---
type: regex
pattern: '^[\s>*`-]*FINISH_FETCH[\s*`]*:[\s*`<]*on\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 1
target: last_message
---
