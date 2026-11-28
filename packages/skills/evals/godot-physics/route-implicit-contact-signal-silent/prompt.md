---
name: route-implicit-contact-signal-silent
description: Implicit trigger. A pasted RigidBody3D script whose body_entered never fires; the prompt names neither the engine nor physics. Should load godot-physics (contact_monitor and max_contacts_reported).
tags: [routing, trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

my crate never prints anything, not when it lands on the floor and not when the ball smacks into it. the ball and the floor both visibly collide with it, so the shapes are there. what am I missing?

```gdscript
extends RigidBody3D

func _ready() -> void:
    body_entered.connect(_on_hit)

func _on_hit(body: Node) -> void:
    print("crate hit by ", body.name)
```
