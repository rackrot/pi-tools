---
type: regex
pattern: '^[\s>*`-]*CONFLICT[\s*`]*:[\s*`<]*hotfix-version-wins\b(?![\s>*`]*(?:\||or\b|/))'
flags: im
weight: 2
target: last_message
---
