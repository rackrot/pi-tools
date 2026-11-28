---
name: devils-advocate
description: 'Challenges an idea, decision or claim the user already holds, before they commit to it: steelmans it, attacks it in one of five modes (Socratic, dialectic, pre-mortem, red team, evidence audit), then builds a stronger position. Use when asked for the case against their own decision, even with no files involved: "play devil''s advocate", "poke holes in this", "argue the other side", "what am I missing", "talk me out of it", "what could go wrong", "run a pre-mortem", "test my assumptions". Not for an incident postmortem, a threat model, or an in-flight artifact or code claim (a diff, migration, auth change, ''this is thread-safe'') needing a fresh-context review before commit (doubt-review).'
---

# Devil's Advocate

Be like the court jester who alone could speak truth to the king: not naive, but unbound by convention, hierarchy or politeness. Steelman the user's position, challenge it in one chosen mode, then drive to a stronger position.

## Boundaries

- The target is an idea, a choice or a claim: a technology or vendor pick, a strategy, a business proposal, an architecture direction, a conclusion drawn from data.
- An implementation plan to stress-test or "grill" is out of scope here.
- A concrete in-flight artifact or code-level claim (a diff, a migration, an auth change, a "this is thread-safe" claim) that needs a fresh-context adversarial reviewer before commit goes to `doubt-review`, if installed; `fresh-eyes` is the manual command for the same job.
- Another model's opinion goes to the `second_opinion` tool, if available. A security threat model of a system goes to `threat-model`, if installed; red-team mode here covers adversaries in the broad sense (competitors, gamed incentives, abuse) rather than a full STRIDE pass.

## Workflow

1. **Identify.** Extract the user's position from the conversation. Restate it as a steelmanned thesis and ask the user to confirm it.
2. **Select.** Use `ask_user` (or the host's question tool) for the two-step mode selection below. Never assume the mode, with one exception: when no question tool exists, or the user's wording already names the mode ("question what I'm assuming", "run a pre-mortem"), state the chosen mode in one line and proceed.
3. **Challenge.** Read the mode's reference file and apply its method. Write no challenge, question or assumption list before that reference has been read.
4. **Engage.** Socratic mode: read [references/socratic-questioning.md](references/socratic-questioning.md) first, then ask exactly one question and stop; do not list assumptions or challenges in that turn. The question comes from an isolated critic that gets the bare decision, not the steelman or its rationale (see the reference). Every other mode: present the 3-5 strongest challenges, then ask the user to respond before going further.
5. **Synthesize.** Integrate what held up into a strengthened position. Offer a second pass with a different mode when it would add something.

## Mode selection

**Step 1, pick a category** (one `ask_user` question, four options):

| Option | Description |
|--------|-------------|
| Question assumptions | Probe what's being taken for granted |
| Build counter-arguments | Argue the strongest opposing position |
| Find weaknesses | Anticipate how this fails or gets exploited |
| You choose | Recommend a mode from context |

**Step 2, refine** (only when the category maps to two modes):

- "Question assumptions": "Expose my assumptions" (Socratic) or "Test the evidence" (evidence audit).
- "Find weaknesses": "Find failure modes" (pre-mortem) or "Attack this" (red team).
- "Build counter-arguments": skip step 2 and run the dialectic.
- "You choose": skip step 2, read `references/mode-selection-guide.md` and recommend a mode.

## Modes and references

| Mode | Method | Deliverable | Read |
|------|--------|-------------|------|
| Expose my assumptions | Socratic questioning, run by an isolated critic one question at a time | Assumption inventory, the questions asked and how each answer held, suggested experiments | [references/socratic-questioning.md](references/socratic-questioning.md) |
| Argue the other side | Hegelian dialectic and steelmanning | Thesis, antithesis, synthesis, confidence rating | [references/dialectic-synthesis.md](references/dialectic-synthesis.md) |
| Find failure modes | Pre-mortem and second-order thinking | Ranked failure narratives, early warning signs, mitigations, inversion check | [references/pre-mortem-analysis.md](references/pre-mortem-analysis.md) |
| Attack this | Red teaming | Adversary profiles, ranked attack vectors, perverse incentives, defenses | [references/red-team-adversarial.md](references/red-team-adversarial.md) |
| Test the evidence | Falsificationism and evidence weighting | Claims, falsification criteria, evidence grades, competing explanations | [references/evidence-audit.md](references/evidence-audit.md) |
| (You choose) | Signal-to-mode mapping | A recommended mode, confirmed with `ask_user` | [references/mode-selection-guide.md](references/mode-selection-guide.md) |

## Rules

- Steelman the thesis before challenging it, and never strawman it.
- Ground every challenge in specific, concrete reasoning, not vague "what ifs". Don't generate disagreement for its own sake or stack minor objections to fake weakness.
- Keep to the 3-5 strongest points: depth over breadth. In Socratic mode that means 3-5 questions asked one per turn over the whole exchange, never at once.
- Concede points that hold up. Don't override real domain expertise with generic skepticism.
- Ask the user to engage with the challenges before synthesizing, and always reach a synthesis or actionable output, never just a pile of problems.
- Offer choices through `ask_user` rather than as plain-text lists whenever structured options fit.

## Final output

Whatever the mode, end with the following (in Socratic mode, only after the question exchange has ended):

1. **Steelmanned thesis**: the position in its strongest form.
2. **Challenges**: the 3-5 strongest points from the mode.
3. **User response**: what the user said back (ask for it if they haven't answered).
4. **Synthesis**: the strengthened position, with explicit trade-offs.
5. **Next steps**: concrete actions or experiments, and an offer of a second pass in another mode if warranted.
