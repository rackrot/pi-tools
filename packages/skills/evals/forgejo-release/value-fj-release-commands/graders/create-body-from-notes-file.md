---
type: regex
pattern: '^[\s>*\-]*\**`?CREATE\**\s*:\**\s*`?fj release (?:-\S+ \S+ )*create\b.*(?:\s-b|\s--body)[ =]"?\$\((?:cat |<)\s*(?:\./)?notes\.md\)'
flags: im
weight: 2
target: last_message
---
