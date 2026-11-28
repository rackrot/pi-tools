---
type: regex
pattern: '^[\s>*\-]*\**`?CREATE\**\s*:\**\s*`?fj release (?:-\S+ \S+ )*create\b.*(?:\s-a|\s--attach)[ =]["'']*(?:\./)?dist/app\.tar\.gz'
flags: im
weight: 1
target: last_message
---
