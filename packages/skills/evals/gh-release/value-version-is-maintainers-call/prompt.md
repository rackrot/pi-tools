---
name: value-version-is-maintainers-call
description: "Value case. The version is not the agent's to pick for a first release (0.1.0 or 1.0.0 is the maintainer's choice, SKILL.md step 3) or below 1.0.0 without a stated convention (references/semver.md edge cases: ask); with a stated convention or above 1.0.0 it is. The bare model picks 0.1.0 and 0.9.0."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

four small single-package libraries on github.com, none has any release tooling, I release them by hand and today is release day. Tell me the version to tag for each.

- R1: acme/slugline. No tags and no releases yet. We have used it internally for about a year and this is its first public release. The README and CONTRIBUTING say nothing about versioning.
- R2: acme/tomlq. Last tag v0.8.3. The whole diff since then: the exported method `Query.raw()` is removed. The README and CONTRIBUTING say nothing about versioning.
- R3: acme/rowcache. Last tag v2.3.1. The whole diff since then: the exported method `Cache.peek()` is removed.
- R4: acme/kvlite. Last tag v0.4.2. The whole diff since then: the exported function `openReadOnly()` is removed. CONTRIBUTING.md says: "Until 1.0, a breaking change bumps the minor version."

end your reply with exactly four lines in the form `R1: <version>`, R1 to R4 in order, version written like `v1.2.3`. If for some repo the number is not yours to settle and you need a decision from me first, write `R1: ASK` on its line instead and put the question above.
