---
name: route-ten-percent-serves-a-quarter
description: Positive trigger. A GO Feature Flag percentage rule serves a different share than the author expects (a flag evaluating to the wrong variation). The prompt names the product but not the skill.
tags: [routing]
max_turns: 5
allowed_tools: [Read, Glob, Grep, Skill]
---

we use go feature flag. I set the new ranking to 10% for pro users last week but the exporter data says roughly a quarter of pro users are getting `treatment`, and it's stable day to day so it's not noise. this is the flag in flags/search.goff.yaml. why is it not 10%, and what should the rule look like?

```yaml
search-ranking:
  variations:
    control: "bm25"
    treatment: "hybrid"
    holdout: "bm25"
  targeting:
    - name: pro
      query: plan eq "pro"
      percentage:
        treatment: 10
        control: 30
  defaultRule:
    variation: control
```
