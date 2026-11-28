---
name: value-earlier-answer-recheck-invoked
description: Value case. Same claim and graders as value-earlier-answer-recheck, but the prompt types the slash command (pi expands /skill:fact-check inline; the bare arm sees it as plain text) and the repo files are pasted, so it runs without --scaffold. The earlier answer's delete advice rests on a claim the files contradict.
tags: [value]
runs: 3
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:fact-check yesterday you told me this about our job runner, and I'm about to delete it. source? did you make that up?

> The `legacy_retry` helper in src/jobs/retry.py has been dead code since v2.3. Nothing imports it, so it's safe to delete it together with the `RETRY_LEGACY` setting.

The whole of src/jobs and the changelog are pasted below, there are no files to open.

src/jobs/retry.py:

```python
import time


def legacy_retry(fn, attempts=3):
    for i in range(attempts):
        try:
            return fn()
        except Exception:
            time.sleep(1)
    return fn()


def retry(fn, attempts=5, backoff=0.5):
    delay = backoff
    for _ in range(attempts - 1):
        try:
            return fn()
        except Exception:
            time.sleep(delay)
            delay *= 2
    return fn()
```

src/jobs/settings.py:

```python
# Flip to False once every queue has moved to retry().
RETRY_LEGACY = True
```

src/jobs/worker.py:

```python
from jobs import settings
from jobs.retry import legacy_retry, retry


def run(job):
    runner = legacy_retry if settings.RETRY_LEGACY else retry
    return runner(job.fn)
```

CHANGELOG.md:

```markdown
# Changelog

## 2.3.0

- Added `retry()` with exponential backoff.
- `legacy_retry()` is deprecated. It stays until every queue has migrated.

## 2.2.0

- Added the jobs worker.
```
