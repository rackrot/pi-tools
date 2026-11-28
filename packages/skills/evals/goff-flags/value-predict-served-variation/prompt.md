---
name: value-predict-served-variation
description: Value case. Predict what GO Feature Flag serves for five contexts. Needs the rule precedence (percentage beats variation), relative percentages, query ignored in defaultRule, a disabled flag serving the SDK default, and a missing bucketingKey attribute skipping the rules; a bare model guesses most of these wrong.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

before we merge this GO Feature Flag file I want to know what it will actually serve. I can't run the cli here, so work it out from how GOFF evaluates flags.

```yaml
new-checkout:
  variations:
    legacy: "v1"
    revamp: "v2"
  targeting:
    - name: staff
      query: email ew "@acme.io"
      variation: legacy
      percentage:
        revamp: 100
        legacy: 0
    - name: paid
      query: plan eq "pro"
      percentage:
        revamp: 10
        legacy: 30
  defaultRule:
    query: country eq "DE"
    variation: revamp

pricing-banner:
  disable: true
  variations:
    shown: true
    hidden: false
  defaultRule:
    variation: shown

team-dashboard:
  bucketingKey: "team.id"
  variations:
    classic: "c"
    modern: "m"
  targeting:
    - query: role eq "admin"
      variation: modern
  defaultRule:
    variation: classic
```

The app always passes its own fallback value to the SDK call. Cases:

- E1: `new-checkout` for `{"targetingKey":"u1","email":"kim@acme.io","plan":"free","country":"FR"}`. Which variation?
- E2: `new-checkout` for users with `plan` "pro" and a gmail address. What percentage of them gets `revamp`? Give a whole number.
- E3: `new-checkout` for `{"targetingKey":"u3","email":"lee@gmail.com","plan":"free","country":"FR"}`. Which variation?
- E4: `pricing-banner` for `{"targetingKey":"u4"}`. Which variation?
- E5: `team-dashboard` for `{"targetingKey":"u5","role":"admin","teamId":"t-9"}`. Which variation?

For E1, E3, E4 and E5 answer with the variation name, or with `SDK-DEFAULT` when the caller gets the fallback value it passed in rather than any variation of the flag. Keep the reasoning short and end your reply with exactly five lines in this form:

E1: revamp
E2: 40
E3: SDK-DEFAULT
E4: legacy
E5: classic

(those values only show the format)
