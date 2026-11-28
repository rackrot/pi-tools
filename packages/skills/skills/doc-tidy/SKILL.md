---
name: doc-tidy
description: "Manual command that tidies one document, with the mode chosen by argument. Default or --v0 applies v0-rewrite. --reorder hands a move-only reordering to `reorder`. --debloat hands off to /skill:debloat. Not for changelogs, ADRs or plans, or docs-vs-code drift (docs-audit)."
disable-model-invocation: true
---

# Doc tidy

Tidy one document. The mode comes from the argument: `--v0` (default) or `--reorder`. `--debloat` only points to /skill:debloat. If the request fits none, say so and stop. Read the whole document first and note what each section must convey.

## Never lost, never in scope

- Facts, numbers, versions, names, warnings, "ask first" rules and scoped conditions ("only on Linux", "before 2.0") survive every mode. If a cut or move could change what a reader does, keep the text.
- Out of scope, say so and stop: changelogs, ADRs, plans, retros and anything whose history is the point; generated files (a header says so, or a script writes them): change the source and regenerate; docs that disagree with the code or one fact copied across files (`docs-audit`).

## Modes

**`--v0`**: run the `v0-rewrite` skill's workflow and rules on the document.

**`--reorder`**: run the `reorder` skill on the named listing; it holds the procedure.

**`--debloat`**: tightening correct but wordy prose is the debloat command; tell the user to run /skill:debloat and stop.

## Every mode

- A pass that finds nothing to improve changes nothing. Never auto-resolve an ambiguity or "fix" a deliberate look-alike; surface it.
- Edit per occurrence, never a blanket replace. Confirm each target exists and report a MISS when it does not, never a silent no-op.
- Create no new files unless asked.
- If the person named the file, edit in place. Before overwriting a file git does not track, or when no file was named, show the proposed change and wait for a yes.
- Afterwards show the diff, or for a large rewrite a summary of what was removed, kept and moved, plus open judgment calls and MISSes.
- Check the result: every fact, number, warning and condition is still there.
