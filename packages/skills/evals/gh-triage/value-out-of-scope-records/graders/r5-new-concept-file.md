---
type: regex
pattern: '^[\s>*\-]*R5\**\s*:\s*\**\s*NEW\s+`?(\.out-of-scope/)?(?![^\s`]*305)[a-z0-9-]*telemetry[a-z0-9-]*\.md'
flags: im
weight: 1
target: last_message
---
