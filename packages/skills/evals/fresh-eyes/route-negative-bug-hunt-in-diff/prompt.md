---
name: route-negative-bug-hunt-in-diff
description: "Near miss: a plain bug hunt in a finished diff. The description sends that to the built-in code review, no claim is being refuted and no fresh-context reader is asked for, so fresh-eyes must stay quiet."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

can you look over this diff for bugs before i merge it? there are no files to open, this is all of it:

```diff
--- a/src/pagination.ts
+++ b/src/pagination.ts
@@ -4,7 +4,8 @@ export function pageRange(total: number, pageSize: number, page: number) {
-  const start = page * pageSize;
-  const end = start + pageSize;
+  const pages = Math.ceil(total / pageSize);
+  const start = (page - 1) * pageSize;
+  const end = Math.min(start + pageSize, total) - 1;
   return { start, end, pages };
 }
```
