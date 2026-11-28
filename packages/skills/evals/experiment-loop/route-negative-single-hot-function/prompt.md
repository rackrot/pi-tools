---
name: route-negative-single-hot-function
description: "Near miss: one targeted optimization of a known hot function, measured once. The skill excludes a single optimization."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

`make bench` puts our parser at 520 ns/op and the profile says 60% of that is in `skipWhitespace`, which walks the input with a regex. Rewrite that one function to use a 256-entry lookup table instead and tell me what speedup to expect. Here it is:

```go
var ws = regexp.MustCompile(`^[ \t\r\n]+`)

func skipWhitespace(b []byte, i int) int {
	if m := ws.Find(b[i:]); m != nil {
		return i + len(m)
	}
	return i
}
```
