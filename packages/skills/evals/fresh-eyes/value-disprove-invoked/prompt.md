---
name: value-disprove-invoked
description: "Value case for the default --disprove mode. The prompt types the slash command (pi expands /skill:fresh-eyes inline; the bare arm sees it as plain text) and states the author's own conclusion. The runner has no subagent tool, so the user asks for the reviewer brief as text: the skill fixes it as the adversarial prompt verbatim with ARTIFACT and CONTRACT filled in and the author's claim left out; a bare model writes its own brief and passes the claim along."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:fresh-eyes PLAN.md and backfill.py, both pasted below. I'm convinced this is airtight: the checkpoint means a crash just resumes where it stopped. Give it a last check before I run it against production.

There is no subagent tool in this session and there are no files to open. I'll open a clean session and paste the reviewer's brief in myself, so reply with the brief text only: no preamble and no notes after it.

PLAN.md:

```md
# Refund backfill

Apply the historic rows in the `refunds` table to `accounts.balance`, once per environment.

- Run `python backfill.py` against the target database.
- Refunds are read in batches of 500, ordered by `id`.
- Each batch is applied, committed, and its last `id` is recorded in `checkpoint.json`.
- Contract: every refund is credited to its account exactly once.
```

backfill.py:

```python
import json
import sqlite3

CHECKPOINT = "checkpoint.json"
BATCH = 500


def load_checkpoint():
    try:
        with open(CHECKPOINT) as f:
            return json.load(f)["last_id"]
    except FileNotFoundError:
        return 0


def save_checkpoint(last_id):
    with open(CHECKPOINT, "w") as f:
        json.dump({"last_id": last_id}, f)


def run(db: sqlite3.Connection):
    last = load_checkpoint()
    while True:
        rows = db.execute(
            "SELECT id, account_id, credit FROM refunds WHERE id > ? ORDER BY id LIMIT ?",
            (last, BATCH),
        ).fetchall()
        if not rows:
            break
        for _id, account_id, credit in rows:
            db.execute(
                "UPDATE accounts SET balance = balance + ? WHERE id = ?",
                (credit, account_id),
            )
        db.commit()
        last = rows[-1][0]
        save_checkpoint(last)


if __name__ == "__main__":
    run(sqlite3.connect("app.db"))
```
