---
name: value-release-only-keep-file
description: "Value case. Where a variant-only keep rule lives under AGP 9.3+ (src/<variant>/keepRules/*.keep); the bare model answers with proguard-rules.pro or an invented path."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our Android app module is on AGP 9.4 and the release build type already uses the new `optimization { enable = true }` block instead of `isMinifyEnabled`. The release build crashes with a ClassNotFoundException for `com.acme.pay.TokenBox`, which native code looks up by name over JNI; I retraced it and that class is the only thing missing.

I want the keep rule in a new file of its own called `tokenbox`, picked up for the release variant only, and I don't want to add anything to `proguardFiles`. Where exactly does that file go and what extension does it need?

End your reply with exactly one line of this form, with the real path filled in (relative to the app module directory):

File: src/...
