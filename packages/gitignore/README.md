# @rackrot/pi-gitignore

Create and update `.gitignore` from [toptal/gitignore.io](https://docs.gitignore.io/use/api) templates plus custom entries.

- **Tool** `gitignore` (agent): `action: list | update`, `templates`, `mode: add|replace|remove`, `custom`, `path`, `dryRun`.
- **Command** `/gitignore <template...>`, `/gitignore remove <template...>`, `/gitignore custom <pattern...>`, `/gitignore list [filter]`. No args prompts for templates.

Template output is kept in a managed block (`# >>> pi-gitignore: node,macos >>>` … `# <<< pi-gitignore <<<`) that is rewritten on each update. Lines outside it are preserved; custom patterns are appended under `# custom` if missing. Only `.gitignore` files inside the project can be written.

> Published with `pnpm publish` so the `workspace:` dependency ranges resolve to real versions; earlier releases were not installable from npm.
