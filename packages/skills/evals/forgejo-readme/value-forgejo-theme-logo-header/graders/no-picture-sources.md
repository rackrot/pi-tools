---
type: regex
pattern: '<source[^>]*prefers-color-scheme|#gh-(dark|light)-mode-only'
flags: i
match: not_contains
weight: 3
target: last_message
---
