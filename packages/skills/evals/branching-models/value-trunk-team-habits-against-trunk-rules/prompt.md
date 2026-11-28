---
name: value-trunk-team-habits-against-trunk-rules
description: "Value case. Seven team habits judged against specific trunk-based rules: pairing counts as review, one developer per short-lived branch, three or fewer active branches, reviews within an hour or two, a release branch cut from a chosen commit rather than HEAD, one person doing the cherry-picks, release branch deleted after production. The bare model accepts the shared branch and the eight open branches and objects to the older cut point and the cherry-pick rotation."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

team of nine, one main branch that we deploy from many times a day, plus a release/X.Y branch for the on-prem build. we want to do trunk-based development by the book. these are our current habits. tell me for each one whether it is fine as it is or has to change.

- H1: two developers who pair all day push straight to main with no PR. CI runs on every push to main, and they run the same four-minute build locally first.
- H2: two developers who are not pairing both commit to the same short-lived branch for a shared story. the branch is merged within two days.
- H3: at any moment there are about eight branches open against main. none of them is older than a day.
- H4: a PR usually waits three to four hours before someone reviews it. it is always merged the same day.
- H5: release/4.2 was cut from a main commit three days behind HEAD, the last one that had been through the full regression run.
- H6: one person, on a rotation, does all the cherry-picks from main onto the release branch. fix authors do not do their own.
- H7: once no customer runs 4.2 any more we delete release/4.2. the tags stay.

end your reply with exactly one line per habit in the form `H1: OK` or `H1: CHANGE`, H1 to H7 in order.
