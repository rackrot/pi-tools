# @rackrot/pi-forgejo-mcp

Connects pi to a [forgejo-mcp](https://git.b4mad.industries/agentic-forges/forgejo-mcp) server served at `https://<host>/mcp` on a self-hosted Forgejo instance. Pi has built-in MCP support; this package registers the server from settings and hides the ~50 tools that are not about repository work (notifications, orgs, teams, webhooks, wiki, time tracking, repo create/fork). Port of the `forgejo-mcp` Claude Code plugin.

```bash
pi install npm:@rackrot/pi-forgejo-mcp
export FORGEJO_TOKEN=...   # Settings > Applications on your instance; grant least scope
```

```json
{
	"forgejoMcp": {
		"host": "git.example.com",
		"token": "${FORGEJO_TOKEN}",
		"exposure": "deferred",
		"curate": true,
		"toolExposure": { "merge_pull_request": "hidden", "delete_*": "hidden" }
	}
}
```

- `host` (required): bare hostname. Without it the extension does nothing.
- `token`: literal, `${ENV}` or `!command` printing the token. Default `${FORGEJO_TOKEN}`.
- `exposure`: `deferred` (default, found via `tool_search`), `codemode`, `direct` or `hidden`.
- `curate`: `false` exposes all ~163 tools.
- `toolExposure`: per-tool overrides (exact names or `*` patterns) merged over the curated list.

Token from Proton Pass (`pass://<vault>/<item>/<field>` or `--vault-name`/`--item-title`/`--field`):

```json
{
	"forgejoMcp": {
		"host": "git.example.com",
		"token": "!pass-cli item view --vault-name Dev --item-title Forgejo --field password"
	}
}
```

Check with `/mcp` or `pi mcp list`. Forge content (issues, comments, logs) is untrusted data. The Forgejo skills (`forgejo-cli`, `forgejo-actions`, `forgejo-release`, ...) are in `@rackrot/pi-skills`.
