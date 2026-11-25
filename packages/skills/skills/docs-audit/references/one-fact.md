# One fact, one home

Read this when one fact (a timeout, a limit, a spec, a definition) lives in several places and the copies disagree or may drift: a config key, a code constant, a CI step and two docs. References do not drift; copies do. The audit is read-only, and nothing is edited until the person approves the plan.

Not for ongoing upkeep: this is a one-time repair of a scattered state, and once the fact has one home it is left alone. Agent instruction files go to `agent-instructions`, if installed.

## Audit (read-only)

1. Name the one fact in scope: the specific value, spec, decision or definition, not the whole document.
2. Enumerate every occurrence across code, config, CI, scripts and docs.
3. Search again by a second method (a different term, a synonym, another tool) and confirm it finds nothing the first pass missed.
4. Classify each hit as exact copy, paraphrase, partial, stale or contradictory.
5. Pick the canonical home: the most authoritative and most maintained location, closest to where the fact changes. Do not promote a weak copy for convenience; if none qualifies, propose extracting a new home. Justify the choice in one line.
6. Choose an action per non-canonical hit: dedupe (redundant), reference (docs link to the home, code imports it, config reads it) or reconcile (it disagrees and needs a human call).
7. Report before editing: a table of location, kind and action; the canonical home; unique details that must be folded into it; contradictions needing a decision, as a list separate from plain duplicates; the exact edit plan. Then ask for explicit approval, and without it stop at the report.

## Edit (after approval only)

1. Make the canonical home complete and current, folding in any detail that lived only in a copy.
2. Reconcile contradictions in the canonical home first. When the right value is unclear, confirm it before replacing anything.
3. Replace each copy with a live reference: a link or "see <home>" in docs, an import or include in code, a shared read in config. Where removal would strand a reader, leave a one-line pointer.
4. Edit per occurrence, never a blanket replace. Confirm each target exists first and report a MISS when it does not, never a silent no-op. Move code structurally with language-aware tools or the editor's refactor, not text rewrites.

## Rules

- No scatter found means no change. An empty result is valid; never invent drift to justify an edit.
- Never decide a contradiction silently.
- Do not consolidate across a trust or permission boundary (private to public, customer-facing to internal) without explicit confirmation.
- Where a platform cannot link back, prefer a reference over deletion.

Done when the canonical home holds the complete, current fact alone, every former copy references it and each reference resolves, and the report says what was consolidated, what was only audited and what still needs a human decision.
