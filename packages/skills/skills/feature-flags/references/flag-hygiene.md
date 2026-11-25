# Flag audit: stale flags and flag debt

An audit covers every flag in the codebase, not one. It is read-only: the output is a report and a registry diff, and each removal is then done one flag per change with section 4 of SKILL.md.

## Rules

1. Never create, change, toggle or archive a flag in a dashboard or through a management API. Removal and flag-state changes are proposals for the user (SKILL.md rule 3 applies).
2. Do not edit code or config during the audit. Write registry and report files only when the user asks; otherwise show them inline.
3. Mark every finding with its evidence (file:line, commit, config value). Say "unknown" for an age or state you cannot determine, and mark an unknown owner `?`; never guess.
4. Use the repo's flag tool and registry location if one exists. Do not add a platform or dependency.

## 1. Inventory

Find the tool first (platform detection hints are in [platforms.md](platforms.md)). Then collect every flag from all sources:

- Code: evaluation call sites, wrapper functions, constants, enums, env reads.
- Config: flagd or GO Feature Flag files, Unleash or LaunchDarkly exports, Helm and IaC values, `.env` templates.
- Platform: read flag lists only through exports, files or read-only commands the user permits. If the dashboard is not reachable, say the platform side is unverified.

Adapt these patterns to the SDK in use:

```
rg -n "(variation|boolVariation|isEnabled|is_enabled|getBooleanValue|getBooleanDetails|BoolVariation|useFlag|flagEnabled)\("
rg -n "(FEATURE|FLAG|ENABLE|DISABLE)_[A-Z0-9_]+" --glob '!*.lock'
rg -n "process\.env\.[A-Z_]*(FLAG|FEATURE|ENABLE)|os\.(Getenv|environ).*(FLAG|FEATURE|ENABLE)"
rg -l "flagd|\"flags\"|\"variants\"|defaultVariant" --glob '*.{json,yaml,yml,toml}'
rg -n "^[A-Za-z0-9_.-]+:\s*$" flags.yaml     # GO Feature Flag: top-level keys are flag keys
```

Compare the sets. Write the keys from code and from config to `/tmp/code-keys.txt` and `/tmp/config-keys.txt`, then:

```
sort -u /tmp/code-keys.txt > /tmp/a; sort -u /tmp/config-keys.txt > /tmp/b
comm -23 /tmp/a /tmp/b    # in code, not in config (orphaned in code)
comm -13 /tmp/a /tmp/b    # in config, not in code (orphaned in config)
sort /tmp/config-keys.txt | uniq -d    # duplicates; also look for case, dash and underscore variants
```

Key age:

```
git log -S'"my-flag-key"' --format='%h %ad %an %s' --date=short   # first and last line: added, last touched
git log --diff-filter=A -S'"my-flag-key"' --format='%ad %an' --date=short   # introduction only
git blame -L <line>,<line> path/to/file                            # owner guess from the definition line
```

The commit author is a hint for the owner, not proof; keep `?` until confirmed. Dynamic keys (`"feature_" + name`) and keys built in other repos or the dashboard do not show up: list them under "not checked".

## 2. Classify

- Stale: untouched in git for a long time, or the same value in every environment (always on or always off), so one branch is dead.
- Orphaned: key in code but not in config or platform (falls back to the default), or in config but not in code.
- Duplicate key: same key defined twice, near-identical keys, or one key with different meanings or defaults at different call sites.
- Undocumented: no purpose, no description, no registry row.
- Ownerless: no owner, or an owner who left or a team that no longer exists.
- Long-lived temporary: release or experiment flag older than its expiry, or than 90 days with none set (the 90 days is a house default, not from a source).
- Nested or interacting: a flag evaluated inside another flag's branch or prerequisites, or several flags read in one function. List the combinations that are untestable or impossible.
- Untested: only one path covered by tests.

## 3. Registry

Reuse the repo's registry and format; otherwise keep one in version control next to the flag definitions (`docs/flags.md` or `flags/registry.yaml`), reviewed in the same PR as the flag change. Fields: `key` (exact key as evaluated), `type` (release, experiment, ops, permission), `owner` (`?` if unknown), `created` (from `git log -S`), `expiry` (required for release and experiment, `none` only for ops and permission), `purpose` (what it guards and the condition to remove it), `default` (value when the flag is missing or the provider fails), `location` (definition file or platform project, main call sites).

```yaml
- key: new-checkout
  type: release
  owner: payments-team
  created: 2026-03-02
  expiry: 2026-06-30
  purpose: Guards the rewritten checkout; remove once 100% for 2 weeks
  default: false
  location: flags.yaml; src/checkout/index.ts:41
```

Show the registry as a diff: `+ added`, `~ changed (field: old -> new)`, `- removed`, with `?` for fields the audit could not establish.

## 4. Removal list and report

Rank candidates: (1) orphaned and dead flags with no behaviour change, (2) always-on or always-off flags with confirmed state, (3) expired temporary flags, (4) nested flags that block simplification. Within a tier, prefer small blast radius and flags that nest others. Each entry names the key, the keep-path (on or off), the evidence, the risk and the owner to confirm.

The report holds the summary (tools found, flag count, counts per finding class), a findings table (key, class, evidence, suggested action), each group of interacting flags with the states that cannot occur or are untested, the registry diff, the ranked removal list, and open questions (unknown owners, unverified platform state, dynamic keys, other repos). Call out what was not checked.

## Keep it from coming back

Suggest, without adding: a CI check that fails on unregistered or expired flags, an expiry field required at creation, and a periodic audit date. These are house practice, not from a source.
