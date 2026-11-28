---
name: goff
description: "Explains how GO Feature Flag (GOFF) fits together: flag files, the relay proxy and OpenFeature providers, plus facts shared by all three (`targetingKey`, evaluation context, the reserved `gofeatureflag` key, `evaluationContextEnrichment`). Use for a GOFF question that spans those parts or does not yet say which one applies. Not for flag files, targeting, rollouts and go-feature-flag-cli (goff-flags); relay proxy config, deployment and debugging (goff-relay-proxy); OpenFeature providers, the Go `ffclient` module, OFREP or other app-code integration (goff-sdk); vendor-neutral flag design, tests and removal (feature-flags); stale-flag audits (flag-hygiene); or other vendors."
---

# GO Feature Flag

GO Feature Flag (GOFF) flags live in a YAML, JSON or TOML file. A relay proxy loads it through retrievers and serves it over HTTP and OFREP. Apps evaluate through an OpenFeature SDK plus a GOFF provider; Go-only apps may embed the Go module instead. Facts here come from the GOFF docs (v1.58.1) and repo files; nothing was run against a live proxy, and items marked verify are unconfirmed.

Vendor-neutral flag practice (design, testing both states, removal) is the `feature-flags` skill; repo-wide stale-flag audits are the `flag-hygiene` skill.

## Route the task

- Flag files (fields, queries, rollouts, lint/evaluate): use the `goff-flags` skill.
- Relay proxy setup, deployment and debugging: use the `goff-relay-proxy` skill.
- App-code and provider work (OpenFeature providers, the Go `ffclient` module, OFREP): use the `goff-sdk` skill.

## Facts that apply everywhere

- `targetingKey` is mandatory in every evaluation context (missing gives `TARGETING_KEY_MISSING`) and must be a stable unique id (user, session), not a random value per request.
- Only attributes in the context reach a query; a missing attribute means the rule does not match.
- The context key `gofeatureflag` is reserved (`currentDateTime`, `flagList`, `exporterMetadata`); never use it for your own data.
- The proxy's `evaluationContextEnrichment` is merged into every context and overrides same-named fields.
- Pass `apiKey` when the proxy has `authorizedKeys` or flagSets; a flagSet request without a key fails.
