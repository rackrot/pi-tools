---
name: value-canary-watch-tiers
description: "Value case. Canary watch results filed by the skill tier table: any 5xx from a critical API and LCP above 4 s are critical however small the delta, new console warnings and LCP up more than 500 ms hold the canary, a new third-party request and minor variance are log-only. The bare model sizes each finding by its percentage instead."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the storefront canary has been sitting at 10% of traffic for 20 minutes and I have to decide about going to 25%. below is what the watch shows against the baseline we recorded before the deploy. we have not agreed thresholds of our own for this service yet, so use sensible standard ones. file each line as CRITICAL (stop promotion), WARNING (hold at 10% and investigate) or INFO (log it and carry on).

- W1: product page LCP is 2.1 s, baseline 1.5 s.
- W2: `/api/cart` p95 response time is 130 ms, baseline 120 ms.
- W3: `/api/checkout/pay`, our critical API, returned one 503 out of about 4,000 canary requests. The baseline window had none.
- W4: the page now makes a request to a third-party font CDN that was not in the baseline.
- W5: checkout page LCP is 4.3 s, baseline 4.0 s.
- W6: two new console warnings on the product page (a deprecation notice), no new console errors.
- W7: search API response time is 310 ms, baseline 140 ms.

end your reply with exactly one line per item in the form `W1: WARNING`, W1 to W7 in order.
