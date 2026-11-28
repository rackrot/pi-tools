---
type: regex
pattern: '^[\s>*\-]*SET\**\s*:\s*\**\s*[`"]?(initializeCommand|onCreateCommand|updateContentCommand|postCreateCommand|postStartCommand)\b'
flags: im
weight: 2
target: last_message
---
