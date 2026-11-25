---
type: regex
pattern: '[Pp]reviously|[Uu]pdated:|~~'
match: not_contains
weight: 2
target:
  source: file
  path: SETUP.md
---
