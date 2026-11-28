---
type: regex
pattern: '^[\s>*\-`]*START\**\s*:\s*[*`]*\s*(?!.*(npm|pnpm|yarn|bun |localhost|dev server|next dev)).*(double|\.html|browser)'
flags: im
weight: 2
target: last_message
---
