---
name: value-removal-order
description: Value case. Ranking four removal candidates, one per tier (orphaned, confirmed always-on, expired temporary, nested), in the skill's order.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm doing the flag debt review for our storefront and I'm at the prioritized removal list. I can't give you repo access; the findings are below and all confirmed. I can do one removal per sprint, so I need the order to take them in, first to last.

- A `promo-banner-v2`: release flag, its expiry date passed three months ago. Currently on in prod and staging, off in dev. Read in 3 files.
- B `bulk-edit`: release flag, added a month ago, expiry two months out, on for 20% of tenants. It is only read inside the on-branch of `admin-v2`, another live flag, so two of the four combinations are never exercised and nobody can simplify the admin code until one of them goes. Read in 2 files.
- C `new-search`: on at 100% in every environment for eight months, confirmed from the platform export. Read in 14 files.
- D `legacy-export`: defined in `flags.yaml`, but nothing in the code reads it any more. 

End your reply with exactly one line in the form `ORDER: X, X, X, X` using the four letters.
