# @rackrot/pi-core

The core rackrot extension, plus shared code for the other `@rackrot/pi-*` packages.

```bash
pi install npm:@rackrot/pi-core
```

Install this one everywhere. It is where always-on behavior goes; today it registers nothing.

## Shared utilities

Other packages in this repo depend on it (`"@rackrot/pi-core": "workspace:*"` in `dependencies`):

```ts
import { readJson, writeJsonAtomic, readSettingsLayers } from "@rackrot/pi-core";
// or: "@rackrot/pi-core/json", "@rackrot/pi-core/settings"
```

| Export                         | Purpose                                                           |
| ------------------------------ | ----------------------------------------------------------------- |
| `readJson(path)`               | Read a JSON object; `{}` if missing or invalid                    |
| `readJsonStrict(path)`         | Same, but throws on bad content and returns the file's indent     |
| `writeJsonAtomic(path, data)`  | Write via temp file + rename, creating parent dirs                |
| `settingsPaths(cwd)`           | Global and project `settings.json` paths, lowest precedence first |
| `readSettingsLayers(key, cwd)` | One settings key from each layer                                  |

Put code here only when two or more packages need it.
