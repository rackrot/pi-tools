---
name: value-refactor-candidates-contract
description: Value case. A request for refactor candidates on a described package must follow references/architecture-review.md, with a recommendation strength from its three labels on each candidate, a Top recommendation, no interface proposals yet and the closing question; the bare model invents its own priority scale and goes straight to code.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

find refactor candidates in our `src/shipping/` package. You can't write files in this environment, so give me the candidates here in chat, in whatever shape you would normally report them. No repo access either; this is everything relevant:

- `ShippingService.quote(order)`: 14 lines, forwards to `RateCoordinator.getRates(order)`.
- `RateCoordinator.getRates(order)`: 25 lines, calls `ZoneResolver.resolve(order.address)`, then `WeightCalculator.total(order.lines)`, then `CarrierClient.fetchRates(zone, weight)`, then `RateFilter.apply(rates, order.customer)`.
- `ZoneResolver`, `WeightCalculator`, `RateFilter`: 15 to 30 lines each, pure functions wrapped in classes, one test file each.
- `CarrierClient.fetchRates(zone, weight)`: 60 lines, HTTP call to the carrier's public API (a third party), retries inline, constructs its own `axios` instance.
- `LabelPrinter.print(order)`: 90 lines, repeats the zone and weight steps by hand, then calls the same carrier API with its own `axios` instance and its own retry loop.
- `ShippingCache`: 40 lines, an in-memory map used only by `RateCoordinator`; `LabelPrinter` does not use it.
- The checkout and admin controllers import `RateCoordinator`, `ZoneResolver` and `LabelPrinter` directly. Git history shows `CarrierClient` and `LabelPrinter` changing together in 9 of the last 12 commits that touched either.
