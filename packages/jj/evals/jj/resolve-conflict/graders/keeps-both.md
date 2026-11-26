---
type: regex
pattern: 'return\s+"hi, "\s*\+\s*name\s*\+\s*"!"|return\s+f"hi, \{name\}!"'
target:
  source: file
  path: greet.py
---
