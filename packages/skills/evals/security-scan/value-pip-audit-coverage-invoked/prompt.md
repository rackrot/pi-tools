---
name: value-pip-audit-coverage-invoked
description: Value case. The prompt types the slash command (pi expands /skill:security-scan inline; the bare arm sees plain text). Which Python dependency layouts the scan's pip-audit step actually audits; the bare model assumes stock pip-audit behaviour and marks the services with an option line or a VCS requirement as audited.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:security-scan hold off on running anything, you have no shell in this session anyway. I'm planning tomorrow's scan of our monorepo and need to know up front which Python services the pip-audit step will cover and which I have to check by hand. Each service is its own directory:

- S1 billing: `pyproject.toml` and a committed `uv.lock`.
- S2 worker: only a `requirements.txt`. First line is `--index-url https://pypi.internal.example/simple`, every other line is `name==version`.
- S3 api: only a `pyproject.toml` whose dependencies are all written `name==version`. No lock file, no requirements file.
- S4 etl: only a `requirements.txt`, every line is `name==version`, no hashes, no options.
- S5 cli: only a `requirements.txt`. One line is `git+https://github.com/acme/toolkit@v2.1.0`, every other line is `name==version`.
- S6 mailer: only a `requirements.txt` and a `constraints.txt` next to it. The first line of `requirements.txt` is `-c constraints.txt`, every other line is `name==version`.

AUDITED means pip-audit looks up at least one of that service's packages. NOT_AUDITED means pip-audit looks up none of them and the service shows up as a gap.

end your reply with exactly one line per service in the form `S1: AUDITED` or `S1: NOT_AUDITED`, S1 to S6 in order.
