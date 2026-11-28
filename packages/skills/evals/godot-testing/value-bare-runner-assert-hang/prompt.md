---
name: value-bare-runner-assert-hang
description: "Value case. In an addon-free SceneTree runner a failed assert() in _initialize() stops the function before quit(), so the headless process never exits; push_error() alone leaves the exit code at 0. Haiku without the skill answers EXITS_0 for the failed assert (checked on Godot 4.7.2: the run hangs, push_error exits 0). Left failing on purpose: with the current description Haiku often answers without opening the skill."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we don't use a test addon, this file is the whole thing. CI runs it with `godot --headless --path . --script res://test/run.gd` using the normal editor binary (a debug build), after an import step, and gates the merge on the exit status of that command. the step has no timeout of its own.

```gdscript
# res://test/run.gd
extends SceneTree

func _initialize() -> void:
	# check A
	assert(DamageCalc.roll(10, 2.0, true, 0) == 20, "crit multiplier")
	# check B
	if DamageCalc.roll(5, 1.0, false, 10) != 0:
		push_error("armor clamp broken")
	print("checks done")
	quit()
```

what does the CI step do in each of these situations?

- S1: someone breaks the crit maths, so the condition in check A is false. check B is fine.
- S2: someone breaks the clamp, so check B takes the push_error branch. check A is fine.

end your reply with exactly one line per situation in the form `S1: LABEL`, where LABEL is one of: EXITS_0, EXITS_NONZERO, NEVER_EXITS.
