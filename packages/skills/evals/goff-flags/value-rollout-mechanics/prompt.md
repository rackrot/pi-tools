---
name: value-rollout-mechanics
description: Value case. Four GO Feature Flag rollout mechanics a bare model guesses wrong - reverse alphabetical bucket layout, undated scheduledRollout steps being skipped, the reserved gofeatureflag.currentDateTime context key for testing time-based rollouts, and progressiveRollout beating percentage in one rule.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm reviewing a colleague's GO Feature Flag change and have four questions I can't settle without running it. Flag:

```yaml
onboarding-flow:
  variations:
    alpha: "short"
    beta: "guided"
    gamma: "video"
  targeting:
    - name: trial
      query: plan eq "trial"
      percentage:
        alpha: 100
        beta: 0
        gamma: 0
      progressiveRollout:
        initial:
          variation: alpha
          percentage: 0
          date: 2030-03-01T00:00:00Z
        end:
          variation: gamma
          percentage: 100
          date: 2030-03-11T00:00:00Z
  defaultRule:
    percentage:
      alpha: 50
      beta: 30
      gamma: 20
  scheduledRollout:
    - defaultRule:
        variation: gamma
    - date: 2030-06-01T00:00:00Z
      disable: true
```

- R1: a non-trial user whose hash lands on bucket 15 (on the 0 to 100 scale) is served by `defaultRule`. Which variation do they get?
- R2: the first `scheduledRollout` step has no `date`. On 2030-04-01, is that step APPLIED (defaultRule now serves gamma to everyone), SKIPPED (defaultRule still splits 50/30/20), or does the whole flag fail to load (ERROR)?
- R3: I want to check with `go-feature-flag-cli evaluate` today what a trial user gets on 2030-03-20 without changing the machine clock. What is the full dotted name of the evaluation context field I set for that?
- R4: on 2030-03-20 a trial user matches the `trial` rule, which has both `percentage` and `progressiveRollout`. Which variation do they get?

Keep the reasoning short and end your reply with exactly four lines in this form:

R1: beta
R2: ERROR
R3: some.context.field
R4: beta

(those values only show the format)
