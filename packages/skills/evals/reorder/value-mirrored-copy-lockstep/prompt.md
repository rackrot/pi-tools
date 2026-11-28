---
name: value-mirrored-copy-lockstep
description: "Value case. /skill:reorder loads the manual skill (pi expands it inline; the bare arm sees plain text). The user names only the English command list; the German copy of the same list is pasted too. The skill keeps mirrored copies in lockstep, so the German file gets the identical new order. The bare model tends to reorder only the file it was pointed at. Graders read the final CHANGED line and the German block."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:reorder the command list in docs/commands.md so it follows the order you actually use the commands in

Both files that are in the docs folder are pasted below, there is nothing to open or write. Reply with the full new content of every file you would change, each between a line `BEGIN <path>` and a line `END <path>`. End your reply with exactly one line in the form `CHANGED: <comma-separated paths of the files you changed>`.

docs/commands.md:

- `acme logs`: show the logs of the running deployment.
- `acme init`: create `acme.yml` in a new project.
- `acme rollback`: return to the previous deployment.
- `acme deploy`: ship the build to the cluster.
- `acme build`: build the project into an image.
- `acme login`: store an API token on this machine.

docs/de/commands.md:

- `acme logs`: zeigt die Logs des laufenden Deployments.
- `acme init`: legt `acme.yml` in einem neuen Projekt an.
- `acme rollback`: kehrt zum vorherigen Deployment zurück.
- `acme deploy`: liefert den Build an den Cluster aus.
- `acme build`: baut das Projekt zu einem Image.
- `acme login`: speichert ein API-Token auf diesem Rechner.
