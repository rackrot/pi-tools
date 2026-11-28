---
type: regex
pattern: '^[\s>*\-]*FETCH\**\s*:\s*\**\s*`?(?:(?:ba)?sh\s+)?[''"]?(?:\S*/pr-comments/|\./)?fetch\.sh[''"]?(?:\s+[''"]?(?:7|https://github\.com/acme/ledger/pull/7)[''"]?)?\s*`?\s*$'
flags: im
weight: 2
target: last_message
---
