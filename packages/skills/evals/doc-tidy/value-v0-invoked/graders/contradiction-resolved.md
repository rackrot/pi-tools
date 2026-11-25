---
type: llm
weight: 3
focus: { source: file, path: SETUP.md }
---

Judge the final SETUP.md, a setup guide that had edit residue: "Updated:" and "Previously" notes, a struck-through Node 16 line, and two lines contradicting each other about whether configuration lives in `acme.yml` or `config.json`.

PASS only if all hold:
1. It reads as a clean first version: no mention of what used to be true, no "now", "no longer", "updated" or strikethrough.
2. The current facts remain: install with `npm install -g acme-cli`, `acme init` writes `acme.yml`, Node 20 or newer, and the token paste step applies only to self-hosted installs.
3. It does not state both `acme.yml` and `config.json` as the configuration file.

FAIL otherwise. Do not reward added commentary or a changelog section.
