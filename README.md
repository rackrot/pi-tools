# pi-tools

Extensions, skills and agents for [pi](https://pi.dev), published under the `@rackrot` npm org.

## Install

```bash
pi install npm:@rackrot/pi-<name>            # global
pi install -l npm:@rackrot/pi-<name>         # this project only
```

Restart pi (or run `/reload`) after installing. Pin a version with `npm:@rackrot/pi-<name>@1.2.3`.

## Packages

| Package | What it does | Install |
| ------- | ------------ | ------- |
| [`@rackrot/pi-model-aliases`](packages/model-aliases) | Model aliases with automatic account/provider failover when usage runs out | `pi install npm:@rackrot/pi-model-aliases` |
| [`@rackrot/pi-skill-index`](packages/skill-index) | Per-skill system-prompt exposure levels and a BM25 `skill_search` tool | `pi install npm:@rackrot/pi-skill-index` |
| [`@rackrot/pi-skills`](packages/skills) | 170 skills imported from claude-plugins and adapted for pi | `pi install npm:@rackrot/pi-skills` |
| [`@rackrot/pi-agents`](packages/agents) | Curated [pi-subagents](https://github.com/tintinweb/pi-subagents) agents with settings-driven model/thinking overrides | `pi install npm:@rackrot/pi-agents` |

Each package README documents its configuration (usually in `~/.pi/agent/settings.json` or `.pi/settings.json`).

### Notes

- **`pi-skills` + `pi-skill-index`**: 170 skills is a lot of system prompt. Install both and set
  `skillIndex.default` to `title` or `hidden`.
- **`pi-agents`** requires [`@tintinweb/pi-subagents`](https://github.com/tintinweb/pi-subagents).
- [`skill-evals`](packages/skill-evals) is a private dev tool (not published); run it from a checkout. It makes real model calls on your account.

## Try before installing

```bash
pi -e npm:@rackrot/pi-model-aliases
```

## Manage

```bash
pi list                                  # installed packages
pi update                                # update all
pi remove npm:@rackrot/pi-<name>
```

## Contributing

```bash
pnpm install
pnpm check                               # biome + tsc
pi -e ./packages/<name>/src/index.ts    # run an extension from source
pi install ./packages/<name>             # install a local checkout
```

To add a package, copy an existing package (e.g. `packages/skill-index`), rename it, and edit the `pi` manifest in its `package.json`.
Host-provided pi libs go in `peerDependencies` (`"*"`), never `dependencies`.
Commits follow Conventional Commits; `pnpm changelog` runs git-cliff. See also [docs/subagents.md](docs/subagents.md).
