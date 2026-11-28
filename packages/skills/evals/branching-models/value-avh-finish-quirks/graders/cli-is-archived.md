---
type: regex
pattern: '^[\s>*`-]*CLI_STATUS[\s*`]*:[\s*`<]*archived\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 1
target: last_message
---
