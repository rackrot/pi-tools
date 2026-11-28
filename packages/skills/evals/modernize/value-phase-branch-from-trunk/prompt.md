---
name: value-phase-branch-from-trunk
description: "Value case. A dispute in a draft plan for getting a system off Node 8: start phase 2 on a branch stacked on the unmerged phase 1, or wait and branch from main. SKILL.md step 8 says merge each phase to trunk before starting the next and cut each phase branch from trunk. The bare model stacks (9 of 9 runs while the case was built). Items the bare model already got right were tried and dropped: beachhead for a component that does not run, deciding when the spike time box expires, no CI gate before the testability milestone, recording cleared hazards, upgrade in place over rewrite."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we're writing the plan for getting our order system off Node 8 / Express 3 onto current versions, in phases. I can't share the repo, so work from what's here. the draft is mostly there, but the team is split on one point and I want your call, with a sentence or two of why, so I can finish the plan.

phase 2 (auth middleware) builds directly on phase 1 (new build pipeline). the phase 1 PR is open and will sit in review for a few days. do we cut the phase 2 branch from the phase 1 branch so nobody is idle (STACK), or hold phase 2 until phase 1 is on main and branch from main (TRUNK)?

end your reply with exactly one line in the form `D1: STACK` or `D1: TRUNK`.
