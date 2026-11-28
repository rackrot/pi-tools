---
type: regex
pattern: '^[\s>*\-]*Q3\**\s*:\s*[*`]*\s*fj\s+issue\s+(-[RrH]\s+\S+\s+)*(depend\s+add\s+(-[RrH]\s+\S+\s+)*#?123\s+#?120|block\s+add\s+(-[RrH]\s+\S+\s+)*#?120\s+#?123)\b'
flags: im
weight: 2
target: last_message
---
