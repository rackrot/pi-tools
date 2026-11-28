---
type: regex
pattern: '^[\s>*\-]*\**`?ADD\**\s*:\**\s*`?fj release (?:-\S+ \S+ )*asset (?:-\S+ \S+ )*create (?:-\S+ \S+ )*["'']*v1\.4\.0["'']* ["'']*(?:\./)?dist/app\.sha256'
flags: im
weight: 2
target: last_message
---
