---
name: value-remote-flag-placement
description: "Value case. Where fj 0.7.0 accepts the remote flag (-R) and the repo flag (-r): not at the top level, only at the noun for fj pr, lowercase -r on whoami. The answers were checked against fj v0.7.0 with --help; the bare model assumes gh-like flags that work anywhere."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm writing a wrapper script around fj 0.7.0 (the Forgejo CLI) and the box I'm on doesn't have fj, so I can't try these. the checkout has two git remotes, `origin` (my fork) and `upstream` (codeberg.org/acme/widgets). for each line below: does fj's argument parser accept it as written, or reject it with "unexpected argument"?

- C1: `fj -R upstream issue search crash`
- C2: `fj issue view -R upstream 12`
- C3: `fj pr merge -R upstream 34`
- C4: `fj pr -R upstream status 34`
- C5: `fj whoami -R upstream`
- C6: `fj release -r codeberg.org/acme/widgets list`

end your reply with exactly one line per command in the form `C1: ACCEPT` or `C1: REJECT`, C1 to C6 in order.
