---
type: regex
pattern: '^[\s`$>]*dotnet-trace\s+collect\b(?=[^\n]*--profile[ =]+["'']?[\w,-]*\bdotnet-common\b)(?=[^\n]*--profile[ =]+["'']?[\w,-]*\bdotnet-sampled-thread-time\b)[^\n]*--providers[ =]+["'']?[\w.:,=-]*System\.Net\.Http\b'
flags: im
weight: 2
target: last_message
---
