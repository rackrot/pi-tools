---
name: route-implicit-exhaustive-match
description: "Routing, implicit. A compiler exhaustivity warning turned error after a new enum case, with a question about silencing it with a wildcard, routes to scala without the language being named."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

CI went red right after I added a `Refunded` state to our payment statuses:

```
[error] -- [E029] Pattern Match Exhaustivity Error: modules/billing/src/main/scala/billing/Invoice.scala:41:4
[error] 41 |    status match
[error]    |    ^^^^^^
[error]    |    match may not be exhaustive.
[error]    |
[error]    |    It would fail on pattern case: PaymentStatus.Refunded
```

we build with -Werror. a colleague says just put `case _ => "unknown"` at the bottom of every match like this one (there are about a dozen) and move on. is that fine or is there a better way to handle it?
