---
name: route-negative-write-one-test
description: Near-miss negative. Writing one named test for one function is test authoring, which the skill excludes; test-gap-audit must not be read.
tags: [routing, negative]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Write me a pytest test for this function. It should cover "1h30m", "45m" and the empty string, which has to raise ValueError.

```python
import re

def parse_duration(text: str) -> int:
    """Return the duration in minutes."""
    m = re.fullmatch(r"(?:(\d+)h)?(?:(\d+)m)?", text)
    if not text or not m:
        raise ValueError(f"bad duration: {text!r}")
    return int(m.group(1) or 0) * 60 + int(m.group(2) or 0)
```
