# Tool scripts

`@tool` scripts that run in the editor, configuration warnings and one-off `EditorScript`s. Any EditorPlugin or addon (plugin.cfg, docks, menus, inspector plugins, gizmos, undo/redo scene edits) -> `godot-editor-tools`.

Contents: `@tool` basics; One-off editor actions: `EditorScript`; C# note.

## `@tool` basics

- `@tool` on the first line makes the script run inside the editor as well as in the game. Its setters, `_ready`, `_process` and `_draw` run while the scene is open.
- `@tool` scripts **do ship** in exports and run normally at runtime. Only editor-only classes (`EditorPlugin`, `EditorInterface` and the like) are missing in an exported game.
- Guard behaviour with `Engine.is_editor_hint()`:

```gdscript
@tool
extends Node2D

@export var radius := 32.0:
	set(value):
		if is_equal_approx(value, radius): return   # avoid setter loops
		radius = value
		queue_redraw()
		update_configuration_warnings()

@export var target: Node2D:
	set(value):
		target = value
		update_configuration_warnings()

func _process(delta: float) -> void:
	if Engine.is_editor_hint():
		return                  # gameplay below only runs in the game
	rotation += delta

func _draw() -> void:
	draw_circle(Vector2.ZERO, radius, Color(1, 1, 1, 0.3))

func _get_configuration_warnings() -> PackedStringArray:
	var w := PackedStringArray()
	if target == null:
		w.append("Assign a target node.")
	return w
```

- `_get_configuration_warnings()` shows the warning icon in the Scene dock. The script must be `@tool` for it to run; call `update_configuration_warnings()` whenever a property it checks changes.
- Every script a `@tool` script calls at edit time must also be `@tool`, or the call fails (the non-tool script is a placeholder in the editor).
- Exported setters run when the scene loads, before `_ready` and before children exist. Check `is_node_ready()` (or `is_inside_tree()`) before touching children or `get_tree()`.
- Changes a tool script makes to nodes are saved into the scene. Keep editor previews out of saved data: draw them in `_draw`, or add helper nodes with no `owner` so they are never saved.
- Saving a tool script reloads it; if the editor freezes on reload, look for a setter that triggers itself or an unguarded `while` loop.
- Tool scripts run project code inside the editor, so a crash takes the editor down. Commit before experimenting.

## One-off editor actions: `EditorScript`

```gdscript
@tool
extends EditorScript

func _run() -> void:
	var root := get_scene()          # the edited scene's root
	for n in root.find_children("*", "Sprite2D"):
		n.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
```

- Open it in the script editor and use File > Run. Changes are applied to the open scene; save the scene afterwards.
- `EditorInterface` (a singleton in 4.2+) reaches the selection, open scenes and the file system.

## C# note

- In C#, `[Tool]` replaces `@tool`. Do not wrap a runtime `[Tool]` node class in `#if TOOLS`: that strips it from exports and breaks every scene that uses it. More in `godot-csharp`.
