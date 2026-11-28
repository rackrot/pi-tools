---
name: route-blocked-push-real-key
description: "Routing, explicit. A pasted GH013 push rejection for a live Stripe key routes to gh-code-security without naming push protection or the skill."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

my push to github just bounced and I need this branch up before standup:

```
remote: error: GH013: Repository rule violations found for refs/heads/feat/payouts.
remote: - GITHUB PUSH PROTECTION
remote:   - Push cannot contain secrets
remote:     —— Stripe API Key ————————————————————————
remote:      locations:
remote:        - commit: 4e1f9ac
remote:          path: config/payments.rb:12
remote:     (?) To push, remove secret from commit(s) or follow this URL to allow the secret.
remote:     https://github.com/acme/billing/security/secret-scanning/unblock-secret/2xYz
 ! [remote rejected] feat/payouts -> feat/payouts (push declined due to repository rule violations)
```

it's the real live key, I pasted it in while debugging two commits ago and nothing has reached the remote yet. what do I do, in order?
