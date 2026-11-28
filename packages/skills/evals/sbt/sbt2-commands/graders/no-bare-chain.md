---
type: regex
pattern: '\bsbt\s+(?:-\S+\s+)*(?:clean|compile|test|testFull)\s+(?:clean|compile|test|testFull)\b|\bsbt\s+[^"''\n]*;'
match: not_contains
target:
  source: file
  path: .github/workflows/ci.yml
---
