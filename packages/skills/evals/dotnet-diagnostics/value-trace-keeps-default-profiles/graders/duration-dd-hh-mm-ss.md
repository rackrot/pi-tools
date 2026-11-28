---
type: regex
pattern: '^[\s`$>]*dotnet-trace\s+collect\b[^\n]*--duration[ =]+["'']?0?0:00:01:30\b'
flags: im
weight: 1
target: last_message
---
