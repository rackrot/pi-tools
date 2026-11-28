---
name: value-verbatim-reviewer-prompt
description: "Value. The reviewer prompt is the skill's adversarial prompt verbatim, with ARTIFACT and CONTRACT filled in and the author's claim left out (SKILL.md step 3)."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

before i commit this i want it torn apart by a reviewer with a clean context. i'll open the new session and paste the prompt in myself, so write me the prompt to paste. reply with the prompt text only, no preamble and no notes after it. there are no files to open, everything is here.

the function:

```py
def reserve_stock(sku: str, qty: int) -> bool:
    row = db.fetch_one("SELECT on_hand FROM stock WHERE sku = %s", sku)
    if row.on_hand < qty:
        return False
    db.execute("UPDATE stock SET on_hand = on_hand - %s WHERE sku = %s", qty, sku)
    return True
```

what it has to guarantee: on_hand never goes below zero, also with 50 checkout workers calling it at the same time for the same sku.

my conclusion: it cannot oversell, because Postgres runs every statement atomically under read committed.
