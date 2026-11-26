# @rackrot/pi-model-aliases

Define model aliases backed by an ordered list of `provider/model` entries. When the account behind
the active entry runs out of usage, requests move to the next entry automatically, mid-run, with no
user action. The exhausted entry is remembered across requests and sessions.

## Install

```bash
pi install npm:@rackrot/pi-model-aliases
```

## Config (`~/.pi/agent/rackrot/config.json(c)` or `.pi/rackrot.json(c)`)

```json
{
	"enabledModels": ["sonnet", "opus"],
	"modelAliases": {
		"sonnet": ["anthropic/claude-haiku-5-5", "github-copilot/claude-haiku-5-5"],
		"gpt": ["command-code/gpt-6-luna", "command-code-2/gpt-6-luna"]
	},
	"modelAliasAccounts": {
		"command-code-2": { "from": "command-code", "apiKey": "$CMD_API_KEY_2" }
	},
	"modelAliasCooldownMinutes": 60
}
```

- Aliases appear as `alias/<name>` models. Bare names work in `enabledModels`.
- Context window, max output, thinking levels and image input are taken from the alias's first entry.
- `modelAliasAccounts` clones an API-key provider under a new name with its own key, so one provider
  can have several accounts. Use the clone name in alias entries. OAuth providers can't be cloned;
  list each provider separately instead.
- `$ENV_VAR` and `!command` forms work for `apiKey`.

## Behavior

- The first entry that is not exhausted is used. Once an exhausted entry's cooldown passes, it is preferred again.
- Within one turn (tool follow-ups, retries) the serving entry is kept for prompt-cache reuse while it is usable.
- Usage exhaustion is detected from the provider error text (usage limit, quota, billing, 402, …). The
  error is rewritten as transient so pi's auto-retry re-routes to the next entry. `retry.enabled` must stay on,
  and `retry.maxRetries` should be at least the number of entries minus one.
- State is stored in `<agent dir>/model-aliases-state.json`.
- Transient errors (overloaded, plain 429) are left to pi's normal retry and do not mark an entry exhausted.

## Commands

- `/model-alias` shows each alias, its active entry (▶), and exhaustion deadlines.
- `/model-alias reset [entry...]` clears exhaustion.

> Published with `pnpm publish` so the `workspace:` dependency ranges resolve to real versions; earlier releases were not installable from npm.
