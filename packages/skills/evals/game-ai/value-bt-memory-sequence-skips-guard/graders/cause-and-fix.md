---
type: llm
weight: 3
---

The user has a memory Sequence (it remembers which child returned RUNNING and resumes there) under a reactive Selector. While `MoveTo` is RUNNING, the Sequence resumes at `MoveTo` on every tick and never re-ticks its first child, `CanSeeTarget`, so the guard does not notice that sight was lost. The reactive Selector only aborts the branch when an earlier sibling takes over, and the Sequence branch is first, so nothing aborts it. Judge the final message.

PASS only if all of these hold:

1. It names the cause as the Sequence resuming at its RUNNING child (`MoveTo`) and so skipping its own guard condition, not re-evaluating `CanSeeTarget` each tick. It does not blame the condition's logic, the 10 Hz tick rate, or `MoveTo` itself.
2. The fix re-checks the guard every tick: make the Sequence a reactive sequence (re-ticks from child 0 each tick), or wrap the guard in a decorator or conditional abort that re-evaluates it every tick and aborts the running branch.
3. If it also mentions what happens to the abandoned branch, it says the branch must be reset (the Sequence's resume index and `MoveTo` state cleared) when it is aborted. This point is optional.

FAIL if the only fix offered is a timer, a timeout on `MoveTo`, a cooldown, a `Wait`, or "check the blackboard key before MoveTo" without making the guard re-evaluate every tick. Do not reward length.
