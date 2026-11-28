---
type: regex
pattern: '\bsbt\s+.*testFull'
weight: 2
target:
  source: file
  path: .github/workflows/ci.yml
---
