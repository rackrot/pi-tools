---
name: value-config-args-semantics
description: Value case. What config.parse() and config.set_enabled_resources() do when nothing is passed, and where config.define_* may be called; the bare model tends to assume defaults in the dict and that an empty list enables nothing.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this before I merge it. Our main Tiltfile defines five resources (api, web, worker, db, redis) and then ends with:

```python
config.define_string_list('services', args=True)
config.define_bool('debug')
cfg = config.parse()

enabled = cfg.get('services', [])
config.set_enabled_resources(enabled)

if cfg['debug']:
    print('debug build')
```

There is no tilt_config.json. I need to know what happens in three situations:

- Q1: A developer runs plain `tilt up` with no arguments, and assume for this question only that the last two lines (the `if cfg['debug']` block) are deleted. How many of the five resources does Tilt enable?
- Q2: Same plain `tilt up`, with the file exactly as shown. What does the expression `cfg['debug']` do: evaluate to False, evaluate to None, or stop the Tiltfile with an error?
- Q3: A colleague wants to move the two `config.define_*` lines into `lib/options.star` and pull that file in with `load()` from the main Tiltfile, leaving `config.parse()` where it is. Does that work?

End your reply with exactly three lines in this form, nothing after them:

Q1: <a number from 0 to 5>
Q2: FALSE or NONE or ERROR
Q3: WORKS or FAILS
