---
type: regex
pattern: '^[\s>*\-]*S2\**\s*:\s*[`*]*\s*(?:ASK\b|git (?:branch|switch (?:-c|--create)|checkout -b)\s+(?!-)\S+\s+4be1a90)'
flags: im
weight: 1
target: last_message
---
