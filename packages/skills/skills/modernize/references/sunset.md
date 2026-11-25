# Sunsets: deprecate or keep, and move the consumers

Read this when the job is deciding whether to sunset a system, API, library or feature, or moving its consumers off it, with or without a wider modernization. Deprecation removes code that no longer earns its keep; migration moves its consumers to the replacement without breaking them.

For a zero-downtime schema change (expand, backfill, contract), use `db-schema-design`, if installed; its `references/migrations.md` has the staging and the safety checklist. Rollout and rollback of the deploys go to `rollout-plan`, and API versioning and deprecation headers to `api-rest-design`. Use each if installed.

## Principles

- **Hyrum's law.** With enough users, every observable behavior is depended on, bugs and timing quirks included. Announcing is not enough; consumers need active migration, and the replacement must reproduce the behaviors they rely on or call out the ones it drops.
- **Plan removal at design time.** Ask "how would we remove this in three years?" Narrow interfaces and feature flags make later removal cheap.
- **The churn rule.** Whoever owns the thing being deprecated migrates its consumers, or ships a backward-compatible change that needs no migration. Don't announce and walk away.

## The decision

Answer these before deprecating anything:

1. Does it still provide unique value? If yes, keep it. If no, go on.
2. Who depends on it? Measure consumers (metrics, logs, dependency and code search such as `search_code` / `search_graph` in codebase-memory), don't guess.
3. Does a replacement exist? If not, build it first. Never deprecate without an alternative.
4. What does migration cost each consumer? Automate it if you can; if it's manual and heavy, weigh it against the maintenance cost.
5. What does *not* deprecating cost? Security exposure, engineer time, complexity tax, over two to three years.

**Advisory or compulsory.** Default to advisory (warnings, docs, consumers move on their own timeline) when the old system is stable. Go compulsory (a hard removal date) only for security issues, blocked progress or unsustainable cost, and then you owe migration tooling, docs and support, not only a date.

## The process

1. **Build the replacement.** It covers every critical use case, has a migration guide, and is proven in production.
2. **Announce.** A notice with status and date, the replacement, the removal date (or "advisory, no date yet"), the reason, and a step-by-step migration guide. Add runtime signals where the platform has them (deprecation warnings, `Deprecation`/`Sunset` response headers, `@deprecated` annotations).
3. **Migrate incrementally**, one consumer at a time: find every touchpoint, switch it, verify behavior matches (tests, integration checks), remove the old references, confirm no regressions.
4. **Remove**, only once measured usage is zero, not because a calendar date passed: delete the code, its tests, docs, config and the deprecation notices themselves. Grep afterwards; nothing should still reference it.

## Zombie code

Code nobody owns but everybody depends on: no commits in months while consumers stay active, no maintainer, failing tests nobody fixes, vulnerable dependencies nobody bumps, docs pointing at systems that are gone. It either gets an owner and real maintenance, or a deprecation with a concrete migration plan. It can't stay in limbo.

## Red flags

- A deprecation with no replacement, or with no migration guide or tooling.
- "Advisory" for years with no progress; new features still landing in the deprecated system.
- Deprecating or removing without measuring current usage.

## Done when

- [ ] The replacement is production-proven and covers every critical use case.
- [ ] A migration guide with concrete steps exists.
- [ ] All active consumers are migrated, verified by metrics or logs.
- [ ] Old code, tests, docs, config and deprecation notices are gone, and a search finds no references.
