---
type: regex
pattern: '^[\s>*\-]*\**`?CREATE\**\s*:\**\s*`?fj release (?:-\S+ \S+ )*create\b(?!.*\s-(?!(?:t|b|a|d|R|r|H|-tag|-body|-attach|-draft|-remote|-repo|-host)(?:[ =`]|$))\S)'
flags: im
weight: 2
target: last_message
---
