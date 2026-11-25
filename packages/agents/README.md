# @rackrot/pi-agents

Curated [pi-subagents](https://github.com/tintinweb/pi-subagents) agents, plus settings-driven
overrides for `model`, `thinking` and `max_turns`.

## Install

```bash
pi install npm:@rackrot/pi-agents
```

Requires `@tintinweb/pi-subagents`. The package declares `pi.subagents.agents`, so the agents
appear read-only in `/agents`. Any file in `.pi/agents/` or `~/.pi/agent/agents/` with the same
name overrides them.

## Agents

| Name                 | Purpose                                                     |
| -------------------- | ----------------------------------------------------------- |
| `reviewer`           | Diff review against a spec; read-only                       |
| `test-runner`        | Runs tests/typecheck/lint, returns only failures; read-only |
| `docs-lookup`        | Current library docs with sources                           |
| `security-auditor`   | Read-only security sweep; returns findings only             |
| `dependency-auditor` | Vets a package against our maintenance criteria             |
| `research-analyst`   | Multi-source web research with citations                    |

## Overrides

Add `agentOverrides` to `~/.pi/agent/rackrot/config.json(c)` or `.pi/rackrot.json(c)`:

```json
{
	"agentOverrides": {
		"reviewer": { "model": "claude-opus", "thinking": "high" },
		"test-runner": { "model": "claude-haiku", "maxTurns": 10 },
		"Explore": { "model": "claude-haiku" }
	}
}
```

- Fields: `model` (`provider/id` or fuzzy name), `thinking` (`off` to `max`), `maxTurns` (integer >= 1).
- Precedence per field, lowest first: package `defaults.json`, global settings, project settings.
- Names are case-insensitive and work for any agent type, including built-ins (`Explore`, `Plan`) and agents from other packages.
- `/rackrot-config agents` opens a settings screen (below). `/rackrot-config show` prints the effective values.

### `/subagent-config` screen

Four rows per agent: `enabled`, `model`, `thinking`, `max turns`. Type to search, Enter or Space to
change a value, Esc to close.

- **Tab** switches the save target between global (`~/.pi/agent/rackrot/config.json`) and project
  (`.pi/rackrot.json`). Changes write immediately.
- **model** opens a picker over your `enabledModels` (project list if set, else global), plus `inherit`.
  For a model outside that list, edit `agentOverrides` in the rackrot config.
- **inherit** removes the value at the selected scope. A lower layer, such as the package default,
  may still supply one; the row's description says which layer does.
- **enabled** has no pi-subagents setting behind it. Turning an agent off writes
  `<scope>/agents/<name>.md` containing only `enabled: false`, which shadows built-in and package
  agents, the same way pi-subagents' own `/agents` Disable does. Turning it on deletes that stub, or
  removes the line from a file you wrote. The row shows the state at the selected scope only.
- Listed agents: the built-ins, this package's, files in the global, project and `.agents` agent dirs,
  and any name already in `agentOverrides`. Agents shipped by other packages appear once they have an override entry.

### How it works, and limits

pi-subagents treats an agent file's `model`, `thinking` and `max_turns` as authoritative over the
caller. The shipped files therefore leave those fields out. A `tool_call` hook rewrites the `Agent`
call's `model`, `thinking` and `max_turns` from settings, and settings win over what the orchestrator passed.

The hook only sees calls made through the `Agent` tool. Not covered: workflow `agent()` options,
scheduled spawns, cross-extension RPC, and possibly `@mention` starts in `direct` mode. Those run
with the agent file's own settings, which for these agents means the parent's model.

If `scopeModels` is on in pi-subagents, a model outside `enabledModels` is rejected.
