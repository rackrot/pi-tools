---
type: regex
pattern: '^\s*from\s+mcp\.server\.mcpserver\.exceptions\s+import\s+(\w+\s*,\s*)*ToolError\b[\s\S]*\braise\s+ToolError\('
flags: im
weight: 1
target: last_message
---
