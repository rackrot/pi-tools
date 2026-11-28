---
type: regex
pattern: '^[\s>*\-]*S3\**\s*:\s*[`*]*\s*git (?:switch (?:-c|--create)|checkout -b)\s+(?!(?:origin/)?release/2\.4[\s`])\S+\s+(?:origin/)?release/2\.4\b'
flags: im
weight: 1
target: last_message
---
