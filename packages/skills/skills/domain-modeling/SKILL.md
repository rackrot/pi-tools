---
name: domain-modeling
description: 'Use when a word in the project means different things to different people, teams or modules ("account", "order", "cancelled") and it has to be settled which is which and what each is called, when naming a new concept, when deciding whether a settled term also needs an ADR, or when creating or editing a GLOSSARY.md. Read it before asking the person clarifying questions about a term. Runs the conversation by challenging each term, proposing one canonical word, testing it on edge cases and against the code, and writing settled terms to GLOSSARY.md. Not for module interfaces (codebase-design) or button and error wording (ux-copy).'
---

# Domain Modeling

Change the project's model deliberately, and write each result down the moment it settles. Reading `GLOSSARY.md` for vocabulary needs no skill. Use this one when the model itself is being decided or corrected.

Not for recording an architecture decision (`adr-writing`, if installed) or for module structure and seams (`codebase-design`, if installed).

## Where the files live

- A single-context repo keeps one `GLOSSARY.md` at the root.
- A multi-context repo keeps a `GLOSSARY-MAP.md` at the root that lists each context, where its glossary lives, and how the contexts relate, plus one `GLOSSARY.md` per context. Read the map first, and ask which context a topic belongs to when it is unclear.
- Create a glossary when the first term is resolved, not before. Read `references/glossary-format.md` before writing or editing one.
- Write an ADR as a short record at `docs/adr/NNNN-slug.md` (next number after the highest existing one): a title and one to three sentences on the context, the decision and why. Add Status, Considered Options or Consequences only when they add something. If an `adr-writing` skill is installed, follow it instead, including its location rules.

## During the session

1. **Challenge terms against the glossary.** When the person's word conflicts with a definition, say so at once: "The glossary defines cancellation as X, but you seem to mean Y. Which is it?"
2. **Sharpen fuzzy language.** When a term is vague or overloaded, propose one canonical word and name the distinction: "Do you mean the Customer or the User?"
3. **Stress-test with scenarios.** Invent concrete edge cases that probe the boundary between two concepts (a partial refund, a customer who changes organizations) and ask the person to settle each.
4. **Cross-reference the code.** When the person states how something works, check the code (with the codebase-memory MCP server, `search_graph` and `get_code_snippet` find the types and functions behind a term). Surface any contradiction: "The code cancels whole Orders, but you described partial cancellation. Which is right?"
5. **Update the glossary inline.** Write each resolved term immediately, so the glossary never lags the conversation. A term is done when the person has confirmed the definition and its `_Avoid_` words.
6. **Offer an ADR sparingly.** Propose one only when the choice is hard to reverse, would surprise a future reader, and was a real trade-off. If any of the three is missing, record nothing beyond the glossary. A costly, debated choice that follows the field's standard practice (money stored as integer minor units) gets no ADR: it surprises nobody.

## What stays out of the glossary

The glossary defines language and nothing else. Keep out implementation detail, specs, scratch notes, and decisions about how something is built. General programming concepts (timeouts, error types) do not belong, even when the project uses them heavily.

## Done when

- Every term raised in the session is defined, merged into an existing term, or deliberately left out.
- Each code contradiction found is either fixed in the model or listed for the owner.
- The glossary diff has been shown to the person.
