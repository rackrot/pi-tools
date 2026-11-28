---
name: value-schema-change-classification
description: Value case. Five schema changes sorted into breaking, dangerous and safe. The bare model calls an added optional argument and an added optional input field safe, where the skill's evolution reference lists both as dangerous; those two carry the weight, the other three are controls so that answering DANGEROUS everywhere does not pass.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our public GraphQL schema has about 200 outside integrators. these five changes are queued for the next release and I have to fill in the release checklist, which has three boxes per change: BREAKING (cannot ship without a migration), DANGEROUS (may ship, but only with notice to integrators and a named approver), SAFE (ships silently).

- C1: add an optional argument `currency: Currency` to the existing field `Order.total`.
- C2: add an optional field `giftMessage: String` to the existing input type `CreateOrderInput`.
- C3: change the default of the argument `first` on `Query.orders` from 20 to 50.
- C4: `Order.shippedAt: DateTime` becomes `Order.shippedAt: DateTime!`, because every order in the system now has the value.
- C5: `Customer.email: String!` becomes `Customer.email: String`, because we now allow accounts without an email.

end your reply with exactly one line per change in the form `C1: BREAKING`, `C1: DANGEROUS` or `C1: SAFE`, C1 to C5 in order.
