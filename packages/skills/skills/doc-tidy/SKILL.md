---
name: doc-tidy
description: Manual command that tidies one document in one of three modes chosen by argument. Default or --v0 rewrites a drifted doc as a clean v0 that says what is true now. --reorder reorders a list, table or section set for its reader, moving items only. --debloat cuts padding and density, never facts. Not for changelogs, ADRs or plans, or docs-vs-code drift (docs-audit).
disable-model-invocation: true
---

# Doc tidy

Tidy one document. The mode comes from the argument: `--v0` (default), `--reorder` or `--debloat`. If the request fits none, say so and stop. Read the whole document first and note what each section must convey.

## Never lost, never in scope

- Facts, numbers, versions, names, warnings, "ask first" rules and scoped conditions ("only on Linux", "before 2.0") survive every mode. If a cut or move could change what a reader does, keep the text.
- Out of scope, say so and stop: changelogs, ADRs, plans, retros and anything whose history is the point; generated files such as the root README plugin catalog (change the source and regenerate); docs that disagree with the code or one fact copied across files (`docs-audit`); AI-sounding tells (`avoid-ai-writing`).

## Modes

**`--v0`**: rewrite so the document reads as its first clean version, never as a changelog or a patch over an older draft.
- Remove "previously", "updated:", "no longer", struck-through lines, superseded versions and decision history the rule does not need.
- Resolve contradictions from the source of truth (the canonical or sibling document, never the damaged copy). If none settles it, keep both and report the conflict.
- Fold a durable lesson into the section where it belonged; rewrite instead of appending.
- Unwrap hard line breaks inside a sentence and link plain-text pointers to files or sections; leave code, tables and quotes as formatted.

**`--reorder`**: move items only; reword, add, remove, split and merge nothing.
- Name one principle a reader can state (lifecycle, dependency, kind, severity, frequency, alphabetical), cluster kin, sequence the clusters by it.
- A deliberate order stays: finish it, and report the call when unclear.
- Give every mirrored copy (a translation, a second surface) the identical order.

**`--debloat`**: cut words, never rules. Target padding, a qualifier the sentence holds without, a fused sentence carrying three ideas, an enumeration a rule plus a short list would cover, a point restated within reach of itself, and history where the rule suffices.
- Compress in place, keeping voice and structure. Teaching prose and worked examples earn their length.
- Move nothing to another file. If the problem is duplication or drift, name it and hand it to `docs-audit` or `--v0`.

## Every mode

- A pass that finds nothing to improve changes nothing. Never auto-resolve an ambiguity or "fix" a deliberate look-alike; surface it.
- Edit per occurrence, never a blanket replace. Confirm each target exists and report a MISS when it does not, never a silent no-op.
- Create no new files unless asked.
- If the person named the file, edit in place. Before overwriting a file git does not track, or when no file was named, show the proposed change and wait for a yes.
- Afterwards show the diff, or for a large rewrite a summary of what was removed, kept and moved, plus open judgment calls and MISSes.
- Check the result: every fact, number, warning and condition is still there (`--reorder`: every item, only positions changed).
