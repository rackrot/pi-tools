---
type: regex
pattern: '^[\s>*\-`]*RELOAD_OPTION\**\s*:\s*[*`]*\s*(scons\s+)?use_hot_reload\s*=\s*(yes|true|1)\b'
flags: im
weight: 1
target: last_message
---
