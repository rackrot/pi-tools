# @rackrot/pi-skill-index

pi lists every loaded skill's name, description and path in the system prompt on every turn. This
package lets you choose, per skill, how much of it the prompt carries, and adds a `skill_search`
tool for the rest. Skills stay loaded, so `/skill:name` and reading a `SKILL.md` path still work.

## Install

```bash
pi install npm:@rackrot/pi-skill-index
```

## Modes

| Mode          | In the system prompt                                    |
| ------------- | ------------------------------------------------------- |
| `full`        | The whole `SKILL.md` body                               |
| `description` | Name, description and path (pi's default listing)       |
| `title`       | Name only, in one line with the other title-only skills |
| `hidden`      | Nothing; found only through `skill_search`              |

Skills with `disable-model-invocation: true` are never shown to the model or returned by search, as in pi.

## Config (`~/.pi/agent/rackrot/config.json(c)` or `.pi/rackrot.json(c)`)

```json
{
	"skillIndex": {
		"default": "title",
		"limit": 5,
		"skills": {
			"git-commit": "description",
			"termwright": "full",
			"godot*": "hidden"
		}
	}
}
```

- `default` applies to skills with no entry. Unset means `title`.
- `skills` keys are exact names or `*` globs. An exact name beats a glob, and a longer glob beats a shorter one.
- Project settings override global ones per key.
- `/rackrot-config skill-index` opens a screen to edit modes (Tab switches global and project; type to filter).
  It takes exact names only. `/rackrot-config show` prints a summary.

## `skill_search`

`skill_search({ query, limit })` returns the name, a description cut to 200 characters and the
`SKILL.md` path; the model then reads the file. Results include `title` and `hidden` skills as well
as listed ones.

Search runs these stages; a stage that fails is skipped and the rest still answer:

1. SQLite FTS5 BM25 over name (weighted highest), description and the skill body.
2. Vector search over stored embeddings, fused with BM25 by reciprocal rank fusion.
3. Reranking of the top 20.
4. Optional decision filter (below).

## Database

Skills, bodies and embeddings live in `~/.pi/agent/rackrot/skills.sqlite` (needs Node's built-in
`node:sqlite`). Each row is tagged `global` or `project` with its project root, and a search only
sees global skills plus the current project's, so a skill that is unavailable to the agent is
never suggested. Rows are re-embedded when the skill changes or the embedding model changes;
until embedding finishes (in the background) search uses BM25 alone.

## Providers

```json
{
	"skillIndex": {
		"embedding": { "provider": "onnx", "model": "Xenova/bge-small-en-v1.5" },
		"reranker": { "provider": "onnx", "model": "Xenova/bge-reranker-base" },
		"decision": {
			"enabled": false,
			"provider": "typesafe",
			"baseUrl": "https://api.typesafe.ai",
			"model": "jev-latest",
			"apiKeyEnv": "TYPESAFE_API_KEY",
			"threshold": 0.5
		}
	}
}
```

- `embedding` and `reranker`: `onnx` (default, local via `@huggingface/transformers`; models are
  downloaded on first use into `~/.pi/agent/rackrot/models/`), `http`, or `none`.
  `http` needs `baseUrl` and calls `POST {baseUrl}/embeddings` (OpenAI style) or
  `POST {baseUrl}/rerank` (Cohere/Jina style). `apiKeyEnv` names an environment variable; keys are
  never read from config. The local embedder uses CLS pooling, which suits the bge models.
- `decision`: off by default. A System One model answers one yes/no question per candidate, and
  candidates under `threshold` are dropped.
  - `typesafe`: any endpoint serving `/v1/systemone` (TypeSafe Jev, or your own), through
    `@typesafe-ai/sdk`. `model` is passed through; `apiKeyEnv` is optional for local endpoints.
  - `laya`: runs [`@receptron/laya`](https://github.com/receptron/laya) locally on ONNX. Install it
    yourself (`npm i @receptron/laya`); it downloads about 1.7 GB of weights on first use.

## Limits

- Changing the embedding model re-embeds every skill in the background.
- The trimming applies to every session that loads this extension, subagents included. A subagent
  that sets `skills: false` or a named list in its own file is not affected by it.
- `full` puts the body in the system prompt of every run; use it sparingly.
- Changing modes mid-session changes the prompt on the next run, which can cost a cache miss.
