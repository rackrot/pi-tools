---
type: llm
weight: 3
---

Facts in the artifact: backfill.py applies a batch with `balance = balance + credit`, commits, and only then writes `checkpoint.json`. A crash after the commit and before the checkpoint write leaves the checkpoint pointing before an already-applied batch, so a re-run credits that batch's refunds a second time. PLAN.md's contract says every refund is credited exactly once.

PASS only if all of these hold:

1. The final report says the "airtight / a crash just resumes" claim does not hold, and names the flaw: the commit and the checkpoint write are not atomic, so a crash between them makes a re-run double-credit that batch.
2. It ties the flaw to the contract (exactly-once crediting) or to the non-idempotent `balance = balance + credit` update.
3. It classifies or treats the finding as real and actionable (change the artifact, for example by recording the checkpoint in the same transaction as the update), not as noise.

FAIL otherwise. A report that only lists generic concerns (batch size, missing tests, locking) without the commit-then-checkpoint gap fails. A report that confirms the script is safe fails. Do not reward length.
