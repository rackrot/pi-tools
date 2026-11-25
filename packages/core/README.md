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

## Shared utilities

Other packages in this repo depend on it (`"@rackrot/pi-core": "workspace:*"` in `dependencies`):

```ts
import { readJson, writeJsonAtomic, readSettingsLayers } from "@rackrot/pi-core";
// or: "@rackrot/pi-core/json", "@rackrot/pi-core/settings", "@rackrot/pi-core/thinking-binding"
```

| Export                         | Purpose                                                           |
| ------------------------------ | ----------------------------------------------------------------- |
| `readJson(path)`               | Read a JSON object; `{}` if missing or invalid                    |
| `readJsonStrict(path)`         | Same, but throws on bad content and returns the file's indent     |
| `writeJsonAtomic(path, data)`  | Write via temp file + rename, creating parent dirs                |
| `settingsPaths(cwd)`           | Global and project `settings.json` paths, lowest precedence first |
| `readSettingsLayers(key, cwd)` | One settings key from each layer                                  |

Put code here only when two or more packages need it.
