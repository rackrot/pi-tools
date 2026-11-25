# @rackrot/pi-skill-index

pi lists every loaded skill's name, description and path in the system prompt on every turn. This
package lets you choose, per skill, how much of it the prompt carries, and adds a `skill_search`
tool for the rest. Skills stay loaded, so `/skill:name` and reading a `SKILL.md` path still work.

## Modes

| Mode          | In the system prompt                                    |
| ------------- | ------------------------------------------------------- |
| `full`        | The whole `SKILL.md` body                               |
| `description` | Name, description and path (pi's default listing)       |
| `title`       | Name only, in one line with the other title-only skills |
| `hidden`      | Nothing; found only through `skill_search`              |

Skills with `disable-model-invocation: true` are never shown to the model or returned by search, as in pi.

## Config (`~/.pi/agent/settings.json` or `.pi/settings.json`)

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
- `/skill-index` opens a screen to edit modes (Tab switches global and project; type to filter).
  It takes exact names only. `/skill-index show` prints a summary.

## `skill_search`

`skill_search({ query, limit })` ranks skills with BM25 over name and description, where a name
match counts three times. It returns the name, a description cut to 200 characters and the
`SKILL.md` path; the model then reads the file. Results include `title` and `hidden` skills as well
as listed ones.

## Limits

- No embedding search. pi has no embedding API for extensions, so ranking is keyword-based. A
  skill whose description shares no words with the query will not be found.
- The trimming applies to every session that loads this extension, subagents included. A subagent
  that sets `skills: false` or a named list in its own file is not affected by it.
- `full` puts the body in the system prompt of every run; use it sparingly.
- Changing modes mid-session changes the prompt on the next run, which can cost a cache miss.
