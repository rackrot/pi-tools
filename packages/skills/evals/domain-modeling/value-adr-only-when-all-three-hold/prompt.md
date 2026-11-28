---
name: value-adr-only-when-all-three-hold
description: "Value case. After a terminology session, a decision record is proposed only when the choice is hard to reverse, would surprise a future reader and was a real trade-off; if one is missing, nothing is recorded beyond the glossary. The bare model proposes a record for any decision that is costly or surprising."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we just wrapped a session on the billing model and all five terms below are already in the glossary. for each one, tell me whether you would also propose writing a decision record (ADR) for it, or leave it at the glossary entry.

- D1: a Subscription belongs to exactly one Organization, never to an individual User. undoing this later means migrating every billing record. we went back and forth for an hour between this and per-user subscriptions. it is the standard arrangement for B2B products like ours.
- D2: an Invoice number is never reused, even when the Invoice is voided. it can't be undone once numbers have gone out to customers, and new engineers are regularly surprised that voided invoices keep their number. there was nothing to weigh: tax law requires it and no alternative was ever on the table.
- D3: Cancellation takes effect at the end of the paid period, not at the click. changing it later would mean re-issuing refunds and restating revenue reports. support and most new hires assume it is immediate. we weighed immediate cancellation with a prorated refund against this and picked it for simpler accounting.
- D4: a Refund is always tied to exactly one Payment, never to an Order as a whole. changing it later would mean restructuring the ledger. we spent two meetings on order-level refunds before dropping the idea. our payment provider models it the same way, and so does every accounting package we looked at.
- D5: the thing customers work in is called a Workspace, not a Tenant. we argued about it for a while, and it surprises people because the old code says tenant. it is a label: renaming it again is an afternoon's work.

end your reply with exactly one line per item in the form `D1: ADR` or `D1: NONE`, D1 to D5 in order.
