---
type: regex
pattern: '^[\s>*`-]*RELEASE_3_2_0[\s*`]*:[\s*`<]*needs-manual-merge\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 1
target: last_message
---
