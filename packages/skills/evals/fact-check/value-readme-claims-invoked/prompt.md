---
name: value-readme-claims-invoked
description: Value case. Same claims and graders as value-readme-claims, but the prompt types the slash command (pi expands /skill:fact-check inline; the bare arm sees it as plain text) and the repo files are pasted, so it runs without --scaffold. One true but odd-sounding line, two wrong, one that no file can settle.
tags: [value]
runs: 3
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:fact-check these four lines from README.md, against the repo, before I tag 1.4.0. The repo is tiny: every file other than the README is pasted below, there are no files to open.

- Python 3.9 or newer.
- Exits with status 3 when there is nothing to do.
- Scans at most 10,000 files per run.
- A typical 20,000-file scan finishes in under a second.

pyproject.toml:

```toml
[project]
name = "tidyfs"
version = "1.4.0"
requires-python = ">=3.11"
```

src/tidyfs/config.py:

```python
MAX_FILES = 50_000
DATE_FORMAT = "%Y-%m"
```

src/tidyfs/cli.py:

```python
import sys
from pathlib import Path

from tidyfs.config import DATE_FORMAT, MAX_FILES


def plan_moves(root: Path) -> list[tuple[Path, Path]]:
    moves = []
    for i, path in enumerate(root.iterdir()):
        if i >= MAX_FILES:
            break
        if path.is_file():
            stamp = path.stat().st_mtime
            moves.append((path, root / _bucket(stamp)))
    return moves


def _bucket(stamp: float) -> str:
    import time

    return time.strftime(DATE_FORMAT, time.localtime(stamp))


def main(argv: list[str]) -> int:
    root = Path(argv[0]) if argv else Path.cwd()
    moves = plan_moves(root)
    if not moves:
        return 3
    for src, dest in moves:
        dest.mkdir(exist_ok=True)
        src.rename(dest / src.name)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```
