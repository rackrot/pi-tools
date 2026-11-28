---
name: value-connection-total-count
description: Value case. A cursor connection with a total on a large filtered list; the skill says to make totalCount nullable so it never forces an expensive count, the bare model tends to declare it Int!.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we're adding `Seller.products` to our public GraphQL API for outside developers. write the SDL for it: cursor pagination, `status` and `category` filter arguments, and the partner portal shows "1-50 of 13,482" above the table so clients need the total as well. the products table has about 90 million rows over all sellers.

SDL only plus a few short notes. end your reply with exactly one line of the form `COUNT FIELD: <the declaration of the total field, copied as it stands in your SDL>`.
