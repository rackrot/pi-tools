---
name: value-sip64-version-gate
description: "Value case. Which Scala 3 minor accepts the SIP-64 given and context-bound forms and clause interleaving (3.6+), and that the older `with` form still compiles there. The bare model tends not to know the 3.6 boundary."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We maintain several services pinned to different Scala 3 versions and a codegen template that emits the snippets below. For each one, tell me whether it compiles on the stated compiler version with default settings: no `-experimental`, no `scala.language.experimental` imports, no `-source` flag. Assume `Ord`, `Show` and `Ev` are ordinary traits that are in scope and that method bodies are fine.

- T1, Scala 3.7.1: `def both[A: {Ord, Show}](a: A): String = ""`
- T2, Scala 3.5.2: `def link[A](a: A)[B](using ev: Ev[A, B]): B = ???`
- T3, Scala 3.6.4: the same method as T2
- T4, Scala 3.5.2: `given [A: Ord] => Ord[List[A]]:` followed by an indented `def compare(xs: List[A], ys: List[A]): Int = 0`
- T5, Scala 3.4.3: `def maxOf[A: Ord as ord](x: A, y: A): A = if ord.compare(x, y) >= 0 then x else y`
- T6, Scala 3.6.4: `given Ord[Int] with` followed by an indented `def compare(x: Int, y: Int): Int = x.compare(y)`

End your reply with exactly six lines in this form and nothing after them:

T1: YES or NO
T2: YES or NO
T3: YES or NO
T4: YES or NO
T5: YES or NO
T6: YES or NO
