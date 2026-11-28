---
name: value-signal-auto-disconnect
description: Value case. Which C# signal connections Godot removes itself when the receiver is freed (built-in signal with +=, custom signal through Connect) and which it does not (custom signal with +=, capturing lambda); the bare model tends to treat += and Connect alike.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

going through the signal wiring in our Godot 4.7 C# game before release. In every case below the receiver (the node whose method or lambda handles the signal) gets QueueFree()'d while the emitter stays alive and keeps emitting. There is no `-=` or Disconnect anywhere in the code today. I need to know for each one whether the engine drops the connection by itself when the receiver is freed, or whether we have to disconnect by hand in _ExitTree.

- C1: `_button.Pressed += OnPressed;` where `_button` is a Button (its built-in signal) and OnPressed is a method of the receiver.
- C2: `GameState.Instance.PausedChanged += OnPaused;` where GameState is an autoload that declares `[Signal] public delegate void PausedChangedEventHandler(bool paused);` and OnPaused is a method of the receiver.
- C3: `GameState.Instance.Connect(GameState.SignalName.PausedChanged, Callable.From<bool>(OnPaused));` with the same signal and the same method as C2.
- C4: `string prefix = Name; _timer.Connect(Timer.SignalName.Timeout, Callable.From(() => _label.Text = prefix + " done"));` where `_timer` is a Timer owned by another scene and `_label` is a field of the receiver.

end your reply with exactly one line per case in the form `C1: AUTO` (the engine disconnects it) or `C1: MANUAL` (we must disconnect it), C1 to C4 in order.
