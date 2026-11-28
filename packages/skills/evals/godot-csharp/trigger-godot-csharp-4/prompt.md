---
name: trigger-godot-csharp-4
description: Implicit trigger. A node script with no partial, a snake_case lifecycle method and a float delta; neither the engine nor the language is named outside the pasted code.
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Speed doesn't show up in the Inspector and the character just sits there when I hit Play. Nothing in the Output panel. This is the whole script, attached to the root of player.tscn:

```
using Godot;

public class Player : CharacterBody2D
{
    [Export] public float Speed = 200f;

    public void _physics_process(float delta)
    {
        Velocity = new Vector2(Speed, 0);
        MoveAndSlide();
    }
}
```

what am I missing?
