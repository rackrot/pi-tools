---
name: deprecation-migration
description: 'Plans retiring an API, service, library, feature or database column and moving its callers to the replacement: the keep-or-retire decision, who migrates the callers, when it is safe to delete, strangler/adapter/flag cutovers, and zero-downtime column renames, drops or retypes via expand/contract. Use for "sunset the v1 API", "get the other teams off the old library", "nobody owns this service but it is still called", "the removal date is here, can we delete it", "rename a column in production without downtime". Read it even with no code to look at: its rules (delete at measured zero usage, the owner migrates callers) differ from common practice. Not for the deploy plan itself (rollout-plan).'
---

# Deprecation and migration

Code is a liability: every line carries tests, patches, dependency updates and onboarding cost. Deprecation removes code that no longer earns its keep; migration moves its consumers to the replacement without breaking them.

Related, if installed: `mysql` for engine-specific locking, `prisma` for Prisma migration-file and `migrate deploy` mechanics (this skill covers the phase order), `api-rest-design` for deciding whether an API change is breaking, the version scheme, notice windows and the Deprecation/Sunset header semantics, `rollout-plan` for staged rollout and rollback of the deploys themselves. Not for upgrading or rewriting a legacy stack (runtime, framework or major version upgrade): use `modernize`.

## Principles

- **Hyrum's law.** With enough users, every observable behavior is depended on, bugs and timing quirks included. Announcing is not enough; consumers need active migration, and the replacement must reproduce the behaviors they rely on or call out the ones it drops.
- **Plan removal at design time.** Ask "how would we remove this in three years?" Narrow interfaces and feature flags make later removal cheap.
- **The churn rule.** Whoever owns the thing being deprecated migrates its consumers, or ships a backward-compatible change that needs no migration. Don't announce and walk away.

## The decision

Answer these before deprecating anything:

1. Does it still provide unique value? If yes, keep it. If no, go on.
2. Who depends on it? Measure consumers (metrics, logs, dependency and code search), don't guess.
3. Does a replacement exist? If not, build it first. Never deprecate without an alternative.
4. What does migration cost each consumer? Automate it if you can; if it's manual and heavy, weigh it against the maintenance cost.
5. What does *not* deprecating cost? Security exposure, engineer time, complexity tax, over two to three years.

**Advisory or compulsory.** Default to advisory (warnings, docs, consumers move on their own timeline) when the old system is stable. Go compulsory (a hard removal date) only for security issues, blocked progress or unsustainable cost, and then you owe migration tooling, docs and support, not only a date.

## The process

1. **Build the replacement.** It covers every critical use case, has a migration guide, and is proven in production.
2. **Announce.** A notice with status and date, the replacement, the removal date (or "advisory, no date yet"), the reason, and a step-by-step migration guide. Add runtime signals where the platform has them (deprecation warnings, `Deprecation`/`Sunset` response headers, `@deprecated` annotations). This skill only sends the headers; `api-rest-design` defines their semantics.
3. **Migrate incrementally**, one consumer at a time: find every touchpoint, switch it, verify behavior matches (tests, integration checks), remove the old references, confirm no regressions.
4. **Remove**, only once measured usage is zero, not because a calendar date passed: delete the code, its tests, docs, config and the deprecation notices themselves. Grep afterwards; nothing should still reference it. If a compulsory date arrives with callers left, migrate the stragglers yourself (churn rule) or escalate; the date sets when you finish the migration, not when you delete.

Patterns for steps 3 and 4 (strangler, adapter, per-consumer feature flag) with examples: read [references/migration-patterns.md](references/migration-patterns.md) when choosing how to route consumers from old to new.

## Schema changes: expand/contract

Data is the one thing a code revert can't roll back. The failure mode is coupling a schema change to the code change: rename a column in the release that starts using the new name, and during the rollout window, when old and new code run at once, one of them queries a column that doesn't exist. Never change a column in place; migrate in additive phases so old and new code are both valid at every step.

Renaming `name` to `full_name`:

1. **Expand.** Add `full_name`, nullable. Deploy. Old code ignores it.
2. **Dual-write.** The app writes both columns on every insert and update. Deploy.
3. **Backfill.** Copy `name` to `full_name` for existing rows in throttled batches, off the hot path; one `UPDATE` over millions of rows locks the table and floods replication.
4. **Switch reads** to `full_name`, still writing both. Deploy and let it bake.
5. **Contract.** Stop writing `name`; then, in a separate later deploy, drop it.

Each step deploys on its own and can be rolled back: if step 4 misbehaves, revert the code and `full_name` is still being filled.

Rules:

- Additive first, destructive last and alone. Adds (nullable column, new table, new index) are safe in any deploy; drops and renames get their own deploy after no code references the old shape.
- Every migration has a tested down path. Write and run the `down` before merging.
- Build large indexes without blocking writes (Postgres `CREATE INDEX CONCURRENTLY`, which can't run inside a transaction block and leaves an `INVALID` index to drop and retry if it fails; MySQL online DDL with `ALGORITHM=INPLACE, LOCK=NONE` where supported).
- Put a risky cutover behind a feature flag, as in the flag pattern.

## Zombie code

Code nobody owns but everybody depends on: no commits in months while consumers stay active, no maintainer, failing tests nobody fixes, vulnerable dependencies nobody bumps, docs pointing at systems that are gone. It either gets an owner and real maintenance, or a deprecation with a concrete migration plan. It can't stay in limbo.

## Red flags

- A deprecation with no replacement, or with no migration guide or tooling.
- "Advisory" for years with no progress; new features still landing in the deprecated system.
- Deprecating or removing without measuring current usage.
- "Just rename the column, it's one line": a schema change and the code depending on it in the same deploy, or a column renamed or dropped in place.
- An add and a drop in the same migration; a migration with no tested down path; a backfill that locks the table.

## Done when

Deprecation:

- [ ] The replacement is production-proven and covers every critical use case.
- [ ] A migration guide with concrete steps exists.
- [ ] All active consumers are migrated, verified by metrics or logs.
- [ ] Old code, tests, docs, config and deprecation notices are gone, and a search finds no references.

Schema migration:

- [ ] The change ships in phases (expand, backfill, contract), not one in-place edit.
- [ ] Old and new code are both valid against the schema at every deploy.
- [ ] Each migration has a tested down path; backfills run in throttled batches.
- [ ] Drops and renames ship in their own deploy after no code references the old shape.
