# --tunnel

Checks the live decision in hand, not an artifact that describes it. A session can inherit its framing from examples, wording, earlier turns or a first plausible answer. The result is advisory: surface candidates and risks, and leave decisions and edits to the main workflow.

1. Name the current direction: the decision the session is about to keep building on.
2. Strip the problem to its goal, constraints and known facts. Remove the session's examples, suggested answer, preferred naming and framing-specific wording.
3. Spawn 2 to 5 independent subagents (default 3) in one message, each given only the stripped restatement. Same-model reads are fine, because this pass makes no cross-model claim; for a cross-model read use `second-opinion`.
4. Collect each read without steering it toward the current direction.
5. Classify each read against the direction:
   - divergent-incompatible: challenges a premise the direction depends on;
   - divergent-compatible: adds or reframes something useful without discarding the direction;
   - convergent: lands near the direction independently.
6. Cluster before reporting. When several reads diverge the same way, name the shared root; the root is the finding and the reads are its evidence. Do not report five specifics that are one gap seen five times.
7. Report divergent-incompatible first, then divergent-compatible, then convergent, with convergence labelled as reassurance. Never call the direction verified, proved or settled, and do not pick a winner by count.
8. Hand control back to the main session. Do not rewrite the plan or pick the final answer.
