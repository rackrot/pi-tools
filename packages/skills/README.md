# @rackrot/pi-skills

Curated and tested skills adapted for pi. 170 skills, 413 eval cases.

```bash
pi install npm:@rackrot/pi-skills
```

The package only declares `pi.skills`. pi lists every loaded skill's description in the system prompt, so with
this many skills pair it with `@rackrot/pi-skill-index` (`skillIndex.default` of `title` or `hidden`), or trim the
package with pi's per-package filters.

## Maintaining

The imported skills are now the source of truth. `scripts/import.ts` bootstraps from a claude-plugins checkout
and refuses to overwrite `skills/` without `--force` (which discards hand edits). `--evals-only` refreshes
`evals/` alone. Run the evals with [@rackrot/pi-skill-evals](../skill-evals/README.md).

> Published with `pnpm publish` so the `workspace:` dependency ranges resolve to real versions; earlier releases were not installable from npm.
