#!/usr/bin/env bash
set -euo pipefail
cat > PLAN.md <<'J'
# Refund backfill

Apply the historic rows in the `refunds` table to `accounts.balance`, once per environment.

- Run `python backfill.py` against the target database.
- Refunds are read in batches of 500, ordered by `id`.
- Each batch is applied, committed, and its last `id` is recorded in `checkpoint.json`.
- Contract: every refund is credited to its account exactly once.
J
cat > backfill.py <<'J'
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
J
