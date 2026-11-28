---
type: regex
pattern: 'claude\s+(?:--bg\s+(?:--name|-n)[ =]["''][^"''\n]+["'']|(?:--name|-n)[ =]["''][^"''\n]+["'']\s+--bg)\s+--\s+"\$\(cat\s|pi\s+(?:--name|-n)[ =]["''][^"''\n]+["'']\s+@'
weight: 3
target: last_message
---
