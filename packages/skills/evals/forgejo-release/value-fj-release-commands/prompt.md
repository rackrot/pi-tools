---
name: value-fj-release-commands
description: "Value case. Exact fj 0.7.0 commands for a release: create from an existing tag with -t, body via -b \"$(cat file)\" (there is no notes-file flag), -a to attach, -d for draft; `release asset create` for a later upload; `release edit <name> -d false` to publish. Checked against fj v0.7.0 --help; the bare model writes gh- or tea-style flags and subcommands."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm writing the release runbook for our Codeberg repo and the laptop I'm on doesn't have fj (the Forgejo CLI, we pin 0.7.0), so I can't check --help; nothing about fj is installed or checked out on this machine, so don't go searching the disk for it. Tag v1.4.0 is already pushed and verified, the release is called v1.4.0 as well, the notes are in notes.md. I need the three exact fj commands:

- CREATE: create the release from that existing tag as a draft, with the contents of notes.md as the body and dist/app.tar.gz attached
- ADD: later, attach a second file dist/app.sha256 to that same release
- PUBLISH: turn the draft into a published release

end your reply with exactly three lines, each command on one single line, in the form `CREATE: <command>`, `ADD: <command>`, `PUBLISH: <command>`.
