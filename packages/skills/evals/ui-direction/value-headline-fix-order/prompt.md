---
name: value-headline-fix-order
description: Value case. A headline over two lines is fixed by cutting words, then widening the measure, and reducing size last.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

new landing page for Kiln, a hand-glazed pour-over coffee set made in Porto, static html/css, look designed from scratch. the hero h1 is "Hand-glazed pour-over coffee sets made in small batches in Porto" at 44px and on a 390px phone it wraps to four lines. three things I could do about it:

- A: reduce the font size
- B: widen the text column (smaller gutters / bigger max-width)
- C: cut words from the headline

in which order should I try them, first to last? end your reply with exactly one line in this form: `ORDER: A, B, C` with the letters in your order.
