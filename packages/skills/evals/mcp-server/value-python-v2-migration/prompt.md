---
name: value-python-v2-migration
description: "Value case. Python SDK v2 renamed FastMCP to MCPServer, moved transport options from the constructor to run(), and has ToolError in mcp.server.mcpserver.exceptions; the bare model answers from v1 memory."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Dependabot bumped `mcp` from 1.9 to 2.3.0 and our server no longer starts:

```
ModuleNotFoundError: No module named 'mcp.server.fastmcp'
```

We want to stay on 2.x, not pin back. This is the whole of server.py:

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("acme", port=9000)

CATALOG = {"Dune": "Frank Herbert"}


@mcp.tool()
def acme_get_author(title: str) -> str:
    """Look up the author of a book in the catalog."""
    if title not in CATALOG:
        return f"Error: no book titled {title!r}"
    return CATALOG[title]


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```

Two things: make it run on 2.3.0, still serving Streamable HTTP on port 9000, and fix the missing-book case, which the client currently shows as a successful result. There is no checkout to look at, so reply with the complete corrected server.py in one code block.
