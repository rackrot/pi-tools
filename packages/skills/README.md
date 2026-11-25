# @rackrot/pi-skills

Skills imported from the adminhead claude-plugins marketplace and adapted for pi. 170 skills, 413 eval cases.

```bash
pi install npm:@rackrot/pi-skills
```

The package only declares `pi.skills`. pi lists every loaded skill's description in the system prompt, so with
this many skills pair it with `@rackrot/pi-skill-index` (`skillIndex.default` of `title` or `hidden`), or trim the
package with pi's per-package filters.

## What was left out

See [MIGRATION.md](MIGRATION.md). In short:

- **Already installed** (33): skills with a copy or renamed equivalent in `~/.agents/skills`, such as `coding` (`efficient-coding`), `git-commit`, `playwright-cli`.
- **Claude Code only** (11): skills that rely on Claude Code's own config, plugins, session transcripts, built-in `/code-review` or forked agents (`ship`, `forgejo-ship`, `session-retro`, `config-audit`, ...).
- **Cross-plugin eval suites** that need a skipped skill (android, forges, godot-meta, jvm, orchestration, specialists, testing).

## What changed in the imported skills

- Claude Code-only frontmatter removed (`argument-hint`, `allowed-tools`, `context`, `agent`, `background`).
- `${CLAUDE_SKILL_DIR}` and `${CLAUDE_PLUGIN_ROOT}` paths made relative to the skill directory; `$ARGUMENTS` reworded.
- `AskUserQuestion` renamed `ask_user_question`; forgejo and AWS MCP tool names changed to `mcp__forgejo__*` and `mcp__aws_mcp__*` (assumes you name those servers `forgejo` and `aws-mcp`).
- Edited by hand: `handoff` (session recovery removed, `--bg` uses the `Agent` tool), `mcp-server` and `mcp-server-audit` (pi MCP config paths and `pi mcp add`), `scala`, `doubt-review`, `mistake-proof`.
- Imported skills may carry their original plugin `LICENSE` files.

Skills that still mention Claude Code are listed at the end of MIGRATION.md; most are accurate references
(`CLAUDE.md` files, other tools) rather than instructions pi cannot follow.

## Maintaining

The imported skills are now the source of truth. `scripts/import.ts` bootstraps from a claude-plugins checkout
and refuses to overwrite `skills/` without `--force` (which discards hand edits). `--evals-only` refreshes
`evals/` alone. Run the evals with [@rackrot/pi-skill-evals](../skill-evals/README.md).
