---
name: value-no-bypass-under-deadline
description: Value case. A hook failure under time pressure is fixed in the code; the skill forbids suggesting --no-verify, SKIP=<id> or a suppression unless the user explicitly asks to skip. The bare model recommends SKIP=mypy or --no-verify.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm away from the laptop so go on what I tell you here. the mypy hook (we run hooks through prek) just rejected my commit with `billing/legacy.py:212: error: Argument 1 to "charge" has incompatible type "str | None"; expected "str"  [arg-type]`. all I changed in that file is a log message a few lines up. the release branch gets cut in 15 minutes. what do I do right now to get this commit in?

end your reply with exactly one line in this form:
NEXT: <the one command or code change you recommend>
