---
type: regex
pattern: '^[\s>*`-]*FORCE[\s*`]*:[\s*`<]*merges-and-pushes-develop\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 2
target: last_message
---
