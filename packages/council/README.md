# @rackrot/pi-council

Two tools that let an agent consult other models. Both call models directly (no tools, no session history),
so the agent must send what the reviewer needs in `context` and `files`.

```bash
pi install npm:@rackrot/pi-council
```

- **`second_opinion`**: one model reviews a plan, diff or diagnosis. Uses your default model; the agent can
  switch to one of the optional models when its `useWhen` fits.
- **`council`**: a preset's councillors (different models, optional role prompts) review in parallel, then a
  synthesizer merges them into consensus, unique findings, disagreements and ranked actions. Modelled on
  oh-my-opencode-slim's council. Councillors here have no codebase tools; pass `files`.

## Configure and prompt injection

`/rackrot-config council` opens a settings screen for both tools (Tab switches between global and project settings; type to search rows). It edits second_opinion's default model, options (model, id, use when, thinking), and the council's presets, councillors (model, thinking, role prompt), synthesizer and limits, and writes the same `council` config shown below, then reloads pi. Fallback chains beyond the first model are edited in the config file. `/rackrot-config show` prints a summary.

Each tool's description carries its usage guidance, the default model and override options' `useWhen` text, or the preset rosters, and each adds a prompt snippet and guideline. These are fixed when pi loads the extension, so saving in the screen runs `/reload` for you; after editing the config by hand run `/reload` yourself. A disabled tool, or `council` with no presets, is not registered. Settings are still re-read on every call, so a model or prompt change takes effect even before the reload.

Models are `provider/model` strings of concrete models (not `alias/...` virtual models). Config goes under
`council` in `~/.pi/agent/rackrot/config.json(c)` or `.pi/rackrot.json(c)` (project overrides global per section).
Settings are re-read on every call; descriptions refresh on `/reload`.

```json
{
	"council": {
		"maxFileBytes": 100000,
		"secondOpinion": {
			"enabled": true,
			"model": "openai/gpt-6.2-sol",
			"thinking": "high",
			"systemPrompt": "Extra guidance appended to the reviewer prompt.",
			"maxTokens": 8000,
			"timeoutSeconds": 300,
			"models": [
				{
					"id": "claude",
					"model": "anthropic/claude-opus-5",
					"thinking": "high",
					"useWhen": "Subtle design or correctness questions"
				},
				{
					"id": "fast",
					"model": "google/gemini-3.8-flash",
					"useWhen": "Quick sanity checks on small changes"
				}
			]
		},
		"council": {
			"enabled": true,
			"defaultPreset": "default",
			"councillorPrompt": "Extra guidance for every councillor.",
			"maxTokens": 8000,
			"timeoutSeconds": 300,
			"synthesizer": {
				"enabled": true,
				"model": ["anthropic/claude-opus-5", "openai/gpt-6.2-sol"],
				"thinking": "high",
				"prompt": "Extra guidance for the synthesizer."
			},
			"presets": {
				"default": {
					"useWhen": "General design or change review",
					"councillors": {
						"reviewer": {
							"model": ["openai/gpt-6.2-sol", "openai/gpt-6.1-terra"],
							"thinking": "high",
							"prompt": "Focus on bugs, edge cases and failure modes."
						},
						"architect": {
							"model": "google/gemini-4-hydrogen",
							"prompt": "Focus on boundaries and long-term maintainability."
						},
						"skeptic": {
							"model": "anthropic/claude-opus-5",
							"prompt": "Challenge assumptions; look for what is missing."
						}
					}
				}
			}
		}
	}
}
```

## Reference

| Key                                            | Default       | Notes                                                                                                               |
| ---------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------- |
| `secondOpinion.model`                          | session model | String or `{ model, thinking }`.                                                                                    |
| `secondOpinion.models[]`                       | none          | `{ id?, model, thinking?, useWhen }`. The agent passes `id` (or the model string) as `model`; unknown values error. |
| `council.presets.<name>.councillors.<n>.model` | required      | String, object, or array = fallback chain tried in order.                                                           |
| `council.presets.<name>.useWhen`               | none          | Shown to the agent so it can choose a preset.                                                                       |
| `council.synthesizer.model`                    | session model | Same forms as councillor `model`. `enabled: false` returns raw answers for the agent to merge.                      |
| `thinking`                                     | model default | `minimal`, `low`, `medium`, `high`, `xhigh`, `max`.                                                                 |
| `timeoutSeconds`                               | 300           | Per model call.                                                                                                     |

If some councillors fail, the synthesizer works from the rest and the failures are listed. If every councillor fails the
tool errors. If the synthesizer fails, the raw councillor answers are returned.

> Published with `pnpm publish` so the `workspace:` dependency ranges resolve to real versions; earlier releases were not installable from npm.
