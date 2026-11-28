---
type: regex
pattern: '^[\s>*`-]*START_PUSHED[\s*`]*:[\s*`<]*yes\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 2
target: last_message
---
