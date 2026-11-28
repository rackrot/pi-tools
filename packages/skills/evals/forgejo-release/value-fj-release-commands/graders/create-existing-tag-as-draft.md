---
type: regex
pattern: '^[\s>*\-]*\**`?CREATE\**\s*:\**\s*`?fj release (?:-\S+ \S+ )*create\b(?=.*(?:\s-t|\s--tag)[ =]["'']*v1\.4\.0)(?=.*(?:\s-d|\s--draft)(?:\s|`|$))'
flags: im
weight: 1
target: last_message
---
