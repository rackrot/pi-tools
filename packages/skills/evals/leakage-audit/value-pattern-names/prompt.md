---
name: value-pattern-names
description: Value case. Three leaky setups must be reported under the audit's own pattern names (tautology, wrong null, shared-pool bias) so a reader can look them up; the bare model invents its own labels.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I am writing up three leakage findings for the team. name the leakage pattern each one is an instance of, in two or three words, the way an independence audit would name it.

- F1: the model clustered 5,000 tickets into 12 topics, and we then scored how accurately that same model assigns those tickets to the 12 topics.
- F2: to show the classifier does not use the hospital a scan came from, we deleted the hospital_id column and accuracy held, but every scan still carries that hospital's scanner watermark.
- F3: train and holdout labels were both produced by the same group of annotators.

end your reply with exactly one line per finding in the form `F1: <pattern name>`, F1 to F3 in order.
