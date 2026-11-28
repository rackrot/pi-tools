---
type: regex
pattern: '^[\s>*\-]*\**`?PUBLISH\**\s*:\**\s*`?fj release (?:-\S+ \S+ )*edit\b(?=.*\s[\"'']*v1\.4\.0)(?=.*(?:\s-d|\s--draft)[ =]false\b)'
flags: im
weight: 2
target: last_message
---
