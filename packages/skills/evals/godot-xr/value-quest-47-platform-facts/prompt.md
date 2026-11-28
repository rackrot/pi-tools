---
name: value-quest-47-platform-facts
description: "Value case. Four Quest platform facts that changed between Godot 4.3 and 4.7 and that the skill's platform reference states: the OpenXR Vendors plugin is optional for export since 4.6, foveation works on the Mobile (Vulkan) renderer since 4.5, subsampled-image foveation defaults to true in 4.7, and frame synthesis is a core setting. A model answering from older knowledge gets most of them wrong."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

We're moving our Quest 3 game from Godot 4.3 to Godot 4.7 (Mobile renderer, OpenXR). Our old setup notes say the things below and I need to know which still hold on 4.7. There are no project files to look at, just answer.

1. "The OpenXR Vendors plugin must be installed or the exported APK won't run as an OpenXR app on Quest at all."
2. "xr/openxr/foveation_level only does something on the Compatibility renderer, on Mobile it is ignored."
3. "xr/openxr/foveation_with_subsampled_images is off unless we turn it on."
4. "Frame synthesis (xr/openxr/extensions/frame_synthesis) comes from the Vendors plugin, so it needs the plugin installed."

A sentence or two per point is enough. Then end your reply with exactly these four lines, each with one of the listed values and nothing else after the colon:

VENDORS_PLUGIN_TO_EXPORT: required | optional
FOVEATION_ON_MOBILE_RENDERER: works | compatibility-only
SUBSAMPLED_FOVEATION_DEFAULT: true | false
FRAME_SYNTHESIS_NEEDS_VENDORS_PLUGIN: yes | no
