---
name: trigger-godot-implicit-gd3-port
description: "Implicit trigger: old-syntax GDScript pasted with errors after an engine upgrade, the engine is never named. Loads the godot skill."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we finally moved the project to the 4.x editor and enemy.gd is all red now. can you rewrite it so it runs again?

```gdscript
extends KinematicBody2D

export var speed = 80
onready var sprite = $Sprite
var velocity = Vector2.ZERO

func _ready():
    $Timer.connect("timeout", self, "_on_timer")

func _physics_process(delta):
    velocity = move_and_slide(velocity)

func _on_timer():
    var bullet = preload("res://bullet.tscn").instance()
    get_parent().add_child(bullet)
    yield(get_tree().create_timer(0.5), "timeout")
    sprite.flip_h = !sprite.flip_h
```
