---
type: regex
pattern: '^[\s>*`-]*FINISH_MERGES_INTO[\s*`]*:[\s*`<]*latest-master\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 1
target: last_message
---
