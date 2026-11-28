# @rackrot/pi-mcp-templates

A catalog of MCP server templates for pi. pi already speaks MCP natively; this package only writes server entries into its config files, so you do not hand-write `mcp.json`.

```sh
pi install npm:@rackrot/pi-mcp-templates
```

Requires `@rackrot/pi-core` (installed alongside the other rackrot packages).

## Commands

- `/mcp-add [id] [--name <server-name>] [--scope project|global] [--exposure codemode|deferred|direct|hidden] [--yes]`: pick a template (fuzzy picker when no id), choose scope and name, confirm, write. An existing server with the same name is only replaced after confirming or with `--yes`. Headless use needs an id and `--yes` for overwrites.
- `/mcp-templates`: list all templates with their source (`builtin`, `global`, `project`); `*` marks names already configured in either `mcp.json`.
- `/mcp-templates show <id>`: print the entry, auth, requirements and docs link.
- `/mcp-templates save <server-name> [--scope project|global] [--yes]`: turn a server from your `mcp.json` into a user template (default: global).

After writing, run `/reload`. OAuth servers then need `/mcp login <name>` (or `pi mcp login <name>`).

## Where files live

| What                   | Path                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| User servers           | `<agentDir>/mcp.json` (`~/.pi/agent/mcp.json`)                                                                       |
| Project servers        | `<project>/.pi/mcp.json` (loaded only in trusted projects; a project entry replaces a user entry with the same name) |
| Global user templates  | `<agentDir>/rackrot/mcp-templates/*.json`                                                                            |
| Project user templates | `<project>/.pi/mcp-templates/*.json`                                                                                 |

Template precedence by `id`: builtin < global user < project user. Each user file holds one template or an array. Invalid templates are reported and skipped.

Default scope is the template's `defaultScope`, else `global` when it has `secrets` or `auth: "env"`, else `project`.

## Template schema

| Field          | Meaning                                                                                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | Letters, digits, `_`, `-`                                                                                                                                                                                            |
| `description`  | One line                                                                                                                                                                                                             |
| `tags`         | String array                                                                                                                                                                                                         |
| `entry`        | A pi `mcpServers` entry: exactly one of `command` (+`args`, `env`, `cwd`) or `url` (+`headers`, `oauth`), plus optional `timeout`, `enabled`, `exposure`, `toolExposure`, `description`. Legacy SSE is not supported |
| `requires`     | Human prerequisites, e.g. `"Node.js 20+"`                                                                                                                                                                            |
| `secrets`      | Env var names the entry references as `${NAME}`; every reference must be listed                                                                                                                                      |
| `auth`         | `oauth`, `env` or `none`                                                                                                                                                                                             |
| `source`       | Docs URL                                                                                                                                                                                                             |
| `defaultScope` | `project` or `global`                                                                                                                                                                                                |

```json
{
	"id": "internal-docs",
	"description": "Company docs search",
	"tags": ["docs"],
	"auth": "env",
	"secrets": ["DOCS_TOKEN"],
	"entry": {
		"url": "https://mcp.example.com/mcp",
		"headers": { "Authorization": "Bearer ${DOCS_TOKEN}" },
		"exposure": "deferred"
	}
}
```

## Builtin catalog

Each entry was checked against the vendor's README or docs (links in `data/templates.json`).

| id                    | What                                                                                         | Auth                                                                                              | Needs                                    |
| --------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `context7`            | Up-to-date library docs and code examples (anonymous, rate limited)                          | none                                                                                              | -                                        |
| `context7-keyed`      | Context7 with an API key for higher rate limits                                              | env (`CONTEXT7_API_KEY`)                                                                          | -                                        |
| `playwright`          | Browser automation through Playwright accessibility snapshots                                | none                                                                                              | Node.js 20+                              |
| `chrome-devtools`     | Drive and debug a live Chrome: DevTools, performance traces, network, console                | none                                                                                              | Node.js LTS, Chrome (stable)             |
| `github`              | GitHub repos, issues, PRs and Actions through the hosted server (many tools, deferred)       | oauth                                                                                             | -                                        |
| `github-pat`          | GitHub hosted server authenticated with a personal access token (many tools, deferred)       | env (`GITHUB_TOKEN`)                                                                              | -                                        |
| `sentry`              | Sentry issues, events and Seer analysis through the hosted server                            | oauth                                                                                             | -                                        |
| `supabase`            | Supabase projects, SQL, migrations and docs through the hosted server (many tools, deferred) | oauth                                                                                             | -                                        |
| `linear`              | Linear issues, projects and documents through the hosted server                              | oauth                                                                                             | -                                        |
| `serena`              | Semantic code retrieval, symbol editing and refactoring backed by language servers           | none                                                                                              | uv                                       |
| `filesystem`          | Sandboxed file read, write and search for the current directory                              | none                                                                                              | Node.js                                  |
| `memory`              | Knowledge-graph persistent memory                                                            | none                                                                                              | Node.js 24+                              |
| `sequential-thinking` | Structured step-by-step reasoning scratchpad                                                 | none                                                                                              | Node.js 24+                              |
| `fetch`               | Fetch web pages and convert them to Markdown                                                 | none                                                                                              | uv                                       |
| `git`                 | Read, search and modify the current git repository                                           | none                                                                                              | uv                                       |
| `toolbox-postgres`    | PostgreSQL schema inspection and SQL through MCP Toolbox for Databases                       | env (`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DATABASE`, `POSTGRES_USER`, `POSTGRES_PASSWORD`) | Node.js, A reachable PostgreSQL database |
| `docker`              | Docker MCP Toolkit gateway: the servers enabled in Docker Desktop                            | none                                                                                              | Docker with the MCP Toolkit (docker mcp) |
| `cloudflare`          | Cloudflare API through code execution (Workers, DNS, R2, ...)                                | oauth                                                                                             | -                                        |
| `figma`               | Figma designs and Code Connect through the hosted server                                     | oauth                                                                                             | -                                        |
| `atlassian`           | Jira and Confluence through the Atlassian Rovo MCP server (v2)                               | oauth                                                                                             | -                                        |

Hosted OAuth servers need no credentials in the file. Large servers (`github`, `supabase`) default to `exposure: "deferred"` to keep tool lists out of the prompt.

## Trust and secrets

- Templates only ever write `${ENV}` references (or a whole-value `!command` you add yourself), never secret values. `/mcp-add` warns about each secret env var that is unset right now.
- Keep credentialed servers in the global file: project `mcp.json` is usually committed and loads only in trusted projects.
- `npx`/`uvx` templates run third-party code on your machine; read the linked source first.
- `serena` runs from the latest git `main` of `oraios/serena`; `playwright` and `chrome-devtools` use `@latest`.

## Relation to `pi mcp add`

`pi mcp add <server> -- <command>` / `--url` writes one hand-specified server. This package adds a reviewed catalog, scope defaults, secret warnings and reusable user templates on top of the same files.
