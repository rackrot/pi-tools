---
type: regex
pattern: '^[\s>*`-]*INSTALL[\s*`]*:[\s*`<]*clone-and-install-script\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 2
target: last_message
---
