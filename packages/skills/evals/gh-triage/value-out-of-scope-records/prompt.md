---
name: value-out-of-scope-records
description: "Value case. Six items being closed; only a durably rejected enhancement is recorded in .out-of-scope/ (appended to the matching concept file, or a new concept file). Rejected bugs, an already-shipped feature and a deferral get no record; the bare model writes a file for the rejected bugs and often for the other two."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Triage pass on github.com/acme/storefront. The repo keeps its rejected requests in `.out-of-scope/`, which currently holds two files: `dark-mode.md` and `plugin-system.md`. I have made the call on these six and none of them will be worked on now. Go by the usual triage rules for that folder and tell me what has to happen in `.out-of-scope/` for each one. The repo is not checked out in this session, so don't go looking for the folder; the titles and my notes are all there is.

- R1: #301, enhancement, "Night theme for accessibility". We still don't do user-facing theming.
- R2: #302, bug, "CSV export starts with a BOM". That is on purpose, Excel needs it. Rejecting.
- R3: #303, enhancement, "Add a --json output flag". We shipped exactly that in v2.3.
- R4: #304, enhancement, "Windows ARM builds". Good idea, but nobody has time for it this quarter.
- R5: #305, enhancement, "Usage telemetry with an opt-in dashboard". This project will never collect telemetry, that is a founding principle.
- R6: #306, bug, "Installer crashes on Windows 7". We dropped Windows 7 two years ago and are not going back. Rejecting.

end your reply with exactly one line per item, R1 to R6 in order, in one of these forms: `R1: APPEND <existing-file>.md`, `R1: NEW <file-name>.md`, or `R1: NONE` when nothing is written to `.out-of-scope/`.
