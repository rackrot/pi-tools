# @rackrot/pi-core

The core rackrot extension, plus shared code for the other `@rackrot/pi-*` packages.

```bash
pi install npm:@rackrot/pi-core
```

Install this one everywhere. It is where always-on behavior goes.

## Features

### Anthropic thinking-block binding

Anthropic ties each thinking-block signature to the `system` prompt, `tools` and earlier messages that
produced it. When that prefix changes (an extension edits a tool description, or pi restarts into an old
session) every earlier block is dropped server-side on every later turn, and pi reports
`Anthropic dropped N thinking blocks: prefix_binding_mismatch` for the rest of the session.

The extension fingerprints `system` + `tools` on each Anthropic request. When the fingerprint changes it
strips thinking from the replayed history once, records a cutoff in the session, and keeps stripping
anything at or before it. Cases the fingerprint can't see (already-broken sessions, rewritten history) are
caught from Anthropic's own `prefix_binding_mismatch` diagnostic, costing one warning instead of one per
turn. Only `anthropic-messages` models are touched; session files keep the original blocks; there is no
configuration. A message that is only thinking is left as is.

Adapted from [luan/agents `pi-thinking-binding`](https://github.com/luan/agents/tree/main/harnesses/pi/agent/packages/pi-thinking-binding) (MIT).
Uninstall that package if you have it, or both will act.

### `/cache-ttl`

Anthropic prompt-cache TTL is 1h by default (writes cost 2x base input instead of 1.25x; reads are unchanged). Core sets pi's own `PI_CACHE_RETENTION=long` unless you already set that variable, so pi applies it only to models that support it. `/cache-ttl [5m|1h]` changes it for the session (no argument toggles), stores the choice in the session, and shows `cache:1h` in the status bar. A switch only affects later cache writes.

Subagents run in the same process and follow the same variable. To keep them on 5m, set `"cacheRetention": "short"` in `~/.pi/agent/subagents.json` (`@tintinweb/pi-subagents`). Inspired by [mackenney/pi-cache-ttl-config](https://github.com/mackenney/pi-cache-ttl-config); uninstall that package if you have it.

### codebase-memory indexing

When the `codebase-memory-mcp` CLI is installed, core starts its daemon and indexes the working directory in the background at session start, so the graph tools have data. Sessions without a UI (subagents, `pi -p`) skip it. Turn it off with `"codebaseMemory": { "enabled": false }` in the global or project config, or under Core in `/rackrot-config`.

## `/rackrot-config`

One command for every rackrot package's config. With no argument it lists the sections of the installed packages (Subagents, Skill index, Council, Model aliases, Forgejo MCP); `/rackrot-config <id>` opens one, `/rackrot-config show` prints a summary of each. Tab in a screen switches the save target between global (`~/.pi/agent/rackrot/config.json(c)`) and project (`.pi/rackrot.json(c)`); project values win. Packages add a section with `registerConfigSection` from `@rackrot/pi-core/config-ui`: pass `fields` for scalar settings (core draws the screen) or `open` for a custom editor.

`/rackrot-init` writes `~/.pi/agent/rackrot/config.jsonc` with every installed package's defaults and examples, commented out. It is only registered while no global config exists.

## Shared utilities

Other packages in this repo depend on it (`"@rackrot/pi-core": "workspace:*"` in `dependencies`):

```ts
import { readJson, writeJsonAtomic, readConfigLayers } from "@rackrot/pi-core";
// or: "@rackrot/pi-core/json", "@rackrot/pi-core/config", "@rackrot/pi-core/thinking-binding"
```

| Export                        | Purpose                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| `readJson(path)`              | Read a JSON object; `{}` if missing or invalid                |
| `readJsonStrict(path)`        | Same, but throws on bad content and returns the file's indent |
| `writeJsonAtomic(path, data)` | Write via temp file + rename, creating parent dirs            |
| `configPath(scope, cwd)`      | `~/.pi/agent/rackrot/config.json(c)` or `.pi/rackrot.json(c)` |
| `readConfig(path)`            | Read a JSONC object; `{}` if missing or invalid               |
| `readConfigStrict(path)`      | Same, but throws on bad content                               |
| `readConfigLayers(key, cwd)`  | One top-level key from each layer (global, project)           |
| `editConfig(path, fn)`        | Rewrite changed top-level keys only, keeping comments         |

Put code here only when two or more packages need it.

`@rackrot/pi-core/retrieval` (embedder, reranker, BM25 and fusion helpers) does not bring the ONNX runtime with it. A package that uses the `onnx` provider depends on `@huggingface/transformers` itself and passes a loader: `createEmbedder(cfg, () => import("@huggingface/transformers"))`.

> Published with `pnpm publish` so the `workspace:` dependency ranges resolve to real versions; earlier releases were not installable from npm.
