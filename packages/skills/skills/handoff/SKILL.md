---
name: handoff
description: "Manual command that carries work across a gap, in three modes. Default: compacts the current conversation into a handoff document a fresh session can pick up, and with --bg launches that session as a background agent. --catchup: rebuilds a returning human's context from live project state, read-only. --recover: recovers a session that died without a handoff, from a transcript digest. Not for restoring a conversation whole (claude --resume)."
disable-model-invocation: true
---

# Handoff

Carry work across a gap. The default mode writes a handoff document so a fresh agent can continue the work. Two flags change the direction: `--catchup` briefs a human who lost the thread, and `--recover` rebuilds the document for a session that ended without one.

## Arguments

`the arguments given with the command` may start with one flag:

- `--bg`: write the document, then launch it as a background agent (below).
- `--catchup`: read [references/catchup.md](references/catchup.md) and follow it. The rest of the arguments is what the human wants to know (a term, "what next", a topic).
- `--recover`: read [references/recover.md](references/recover.md) and follow it. The rest of the arguments picks the session (an id, a prefix or a topic). The reference's `<script>` is `python3 -I scripts/session_recover.py` and `<this-session-id>` is `${CLAUDE_SESSION_ID}`; run the script exactly that way.

With none, write the handoff document. Strip the flag and treat the rest as a description of what the next session will focus on; tailor the document to that. With no description, cover the work as it stands.

## Write the document

Save it to the OS temporary directory, not the workspace: `mktemp "${TMPDIR:-/tmp}/handoff-XXXXXX.md"` (`%TEMP%` on Windows).

Include:

- **Goal**: what the work is for and what "done" looks like.
- **State**: what is finished, what is in progress, and what was tried and rejected, with the reason.
- **Next steps**: the concrete next actions, in order.
- **Open questions**: decisions still waiting on the user.
- **References**: paths and URLs of specs, plans, ADRs, issues, commits, branches and diffs. Reference them; don't copy their content.
- **Suggested skills**: which skills the next agent should call the Skill tool for.

Redact secrets and personal data: API keys, tokens, passwords, and personally identifiable information.

Without `--bg`, finish by giving the file path and a one-line way to use it, for example starting a new session with `claude "$(cat <file>)"`.

## --bg: launch a background agent

With `--bg`, the document becomes the prompt of a new background session that starts in the current working directory and returns immediately:

```bash
claude --bg --name "<descriptive name>" -- "$(cat <file>)"
```

- Always pass `--name` (alias `-n`) with a short descriptive name such as `"Fix login bug"`. It is the display name in `claude agents`, the session picker and the terminal title.
- Pass the summary through `$(cat <file>)`, never inline in the command, so the shell doesn't run backticks or expand `$` in it.
- Because the summary becomes the agent's prompt, write it as instructions to that agent ("Continue ..."), and double-check the redaction.
- Report the id the command prints and tell the user how to manage the session: `claude agents` lists it, `claude attach <id|name>` opens it, `claude logs <id|name>` shows recent output, `claude stop <id>` stops it.
- If `claude --help` doesn't list `--bg` (older Claude Code), skip the launch, give the file path, and say why.
