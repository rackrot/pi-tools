---
name: route-implicit-untrusted-clone
description: "Routing, implicit. A pasted 'config files are not trusted' error after cloning someone else's repo, with a question about whether running the build is safe, routes to mise without asking for mise help or naming a mise command to run."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I cloned a contractor's repo yesterday to review their work (haven't opened it in an editor yet, so nothing to look at on your side). every time I cd into it my prompt prints this and python isn't found:

```
mise ERROR Config files in ~/src/vendor-billing/mise.toml are not trusted.
```

a colleague says just run the build once and the message goes away. is that fine to do with code I haven't read, and if not what should I do first?
