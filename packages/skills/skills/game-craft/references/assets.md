# Game art assets: direction, pipeline, import, provenance

Turn visual intent into a consistent, engine-ready asset set. Image generation, bought packs and hand-drawn art are all inputs to one controlled pipeline; none proves an asset is shippable. Mainly 2D. Not for web or app UI visuals, game UI layout (`ui.md`), sound (`audio.md`), shaders (`godot-shaders`), or store capsule and screenshot sizes (`game-publish`). Never install packages or tools without asking; confirm a tool exists before suggesting its command.

Templates, copied into the project and filled in: [../assets/art-direction-brief.md](../assets/art-direction-brief.md) (game frame, visual system, technical contract, visual target) and [../assets/asset-manifest.json](../assets/asset-manifest.json) (per asset: id, path, status, technical, visual locks, source and license record, verification).

## Contents

1. Workflow
2. Art direction
3. Pipelines
4. Import checkpoints
5. Provenance and licenses

## 1. Workflow

1. Inspect first: existing screenshots, concept art, sprites, fonts, import settings, camera framing, target resolution, naming. Keep a coherent existing direction unless a redesign is requested.
2. Lock the technical frame: engine, 2D or 3D, camera and view, native viewport and display scale, on-screen asset sizes, world scale (pixels per unit or tile size), transparency, palette size, filtering, frame counts, texture budget, platforms. Fill the brief template.
3. Make the manifest: every asset, state, variant, size, anchor or pivot, collision role, source, license and status. Mark greybox placeholders as placeholders.
4. Approve one visual target (a hero asset or style board) placed in a real gameplay capture at native scale over common and worst-case backgrounds, before producing a full set. The target is a contract: compare later output against it at the same size, background and light.
5. Produce families: reuse the approved seed as the reference, keep palette, view, proportions, light, outline and texture density fixed, work in small batches, change one variable per edit. Normalise deterministically with ordinary image tools (crop, size, anchor, slice, name, compress, check alpha).
6. Validate in context: a contact sheet, then the running game at native resolution. Fix the source asset, not only runtime compensations. An asset is production-ready only after the technical checks and a native-scale, in-engine look. Check three distances: native scale (identity and state read at once), working scale (seams, edges, clusters), in context. An asset that only works zoomed in is not working game art.
7. Record provenance before calling anything production-ready.

## 2. Art direction

- Describe a system in observable axes (shape, silhouette, value bands, colour roles with exact swatches, edge treatment, material, light direction, detail density, camera, motion). "Beautiful", "cinematic" and "high quality" are not constraints; translate reference images into palette, geometry, composition, material, light and mark-making. **Never use a living artist's name as the style definition.**
- Fix the palette as named roles with hex values and a maximum colour count per asset for pixel art. Keep gameplay-critical colours (danger, pickups, the player) unique to their role. Fix world scale once (tile size, pixels per unit, character height in tiles, the integer zoom levels). One light direction for the whole game unless the art direction says otherwise.
- Naming: one scheme in the brief, lowercase snake_case such as `<category>_<subject>_<state>_<frame>.png` (`chr_player_run_03.png`), zero-padded frames, folders by category not by tool. Never rename a shipped asset without updating every reference and, in Godot, moving its `.import` and `.uid` sidecars (or rename in the editor).
- **Drift signals:** character height, head ratio, limb thickness or costume layers change between states; outline colour or width differs between neighbours; highlights imply different light directions; the palette grows near-duplicates; texture noise rises on later generations; camera angle shifts across an isometric or top-down set; ground contact and shadow footprint move between frames; icons mix filled, outlined, bevelled and painterly styles. On drift go back to the approved seed and make a constrained edit; do not keep editing a drifted derivative until it becomes the accidental reference.
- Image-generation briefs use fixed blocks, with invariant blocks identical across a family: PURPOSE, SUBJECT, VIEW, ART DIRECTION, GAME-SCALE (what must read at WxH), OUTPUT (dimensions, transparent or scene background, frame count), LOCKS (identity, proportions, palette, light, line weight), EXCLUDE (text, labels, mockup frames, scenery, duplicates, cropped edges, signatures). For edits state what changes and what stays. Request transparency through the tool's native option, then verify the alpha channel.

## 3. Pipelines

- **Never trust a generated grid, transparency, seam, pivot or dimension; inspect it.** Generated animation frames drift: produce the whole action as one strip referenced to the approved seed, then slice with one shared scale and one anchor (usually bottom-centre). If frame 1 must match the shipped idle pose, restore the exact seed after slicing. Preview as a contact sheet and in motion.
- True pixel art: treat generated output as a draft; enforce a real grid, palette, clusters and frames in a pixel editor; remove blended pseudo-pixels, single-pixel noise and banding; resize only by integer factors with nearest-neighbour.
- Tiles: define tile size and neighbour rules (corners, edges, inner corners, the engine's autotile layout) before drawing; produce base, transitions, corners and decoration as one family; decorative shadows must not look like walls; test seamless materials in a 3x3 repeat at full size and at the most zoomed-out camera; test terrain combinations in the engine's autotile system, not only on the sheet; add the padding or extrusion the atlas tool expects to stop bleeding at fractional camera positions.
- Backgrounds: split sky, far, mid, near and foreground by scroll speed; keep unique landmarks away from horizontal seams on repeating layers; overlap layers so camera movement cannot expose gaps; keep a low-contrast band behind characters and projectiles.
- UI art: labels, numbers, dynamic copy, focus states and accessibility text stay code-native, never baked into images; icons one family, simple symbols as SVG; panels as 9-slice, checked at several sizes; states (normal, hover or focus, pressed, disabled, selected, warning) where the art changes.
- 3D: concepts and generated multi-view sheets are references only; author or clean in a DCC such as Blender (topology, normals, UVs, texel density, rig, weights); apply transforms and put the origin where gameplay needs it; simplified collision proxies, never the render mesh by default; LODs and shared materials; export glTF 2.0 (`.glb`) as the default runtime interchange and keep the editable source; never infer topology, UVs, rigging or licensing from a preview render.
- Checks need no bundled scripts: an image editor, the engine's import dock, or ImageMagick (`magick identify -format '%f %wx%h %[channels]\n' sprites/*.png`; `magick montage sprites/*.png -filter point -geometry 192x192+4+4 -background '#808080' sheet.png`).

## 4. Import checkpoints

**Godot 4** (checked against the 4.7 docs; follow the project's version in `project.godot`):

- **Texture filtering and repeat are not import options.** Set them on the node (`CanvasItem.texture_filter`, `texture_repeat`) or project-wide in `rendering/textures/canvas_textures/default_texture_filter` (Nearest for pixel art); in 3D on the material or the shader's sampler hints. "Flags > Filter" advice is Godot 3.
- Compress Mode defaults to Lossless. "Detect 3D" flips a texture used in 3D to VRAM Compressed with mipmaps; pick VRAM compression deliberately for large 3D textures and keep pixel art Lossless. Generate mipmaps (`mipmaps/generate`) only for textures shown much smaller than their size, mainly in 3D.
- Commit each asset's `.import` file and, for scripts and shaders, the `.uid` sidecar (4.4+); never commit `.godot/`. Check `Sprite2D`, `AnimatedSprite2D` frames, atlas regions and the `TileSet` terrain setup in the editor (TileMap specifics: `godot`).

**Unity:** Texture Type Sprite (2D and UI), one Pixels Per Unit for the whole game, Filter Mode Point for pixel art, compression None or high quality for pixel art, mipmaps off for 2D, Read/Write off unless runtime pixel access is needed. **Web engines (Phaser, PixiJS, three.js):** stable atlas metadata and file names; nearest sampling and integer canvas scaling for pixel art; stop CSS resizing from blurring the canvas.

## 5. Provenance and licenses

Record per shipped asset: id and path, creator or source URL or order number, date, tool and model version if generated, prompt or reference ids, license name and version with a saved copy or link to the terms, attribution text and where it must appear, restrictions (commercial use, modification, redistribution of source files), edits and who made them, approval.

- "Free", "royalty-free", search-visible or generated is not a license. Check terms at the original source, not a repost. Keep attribution through atlas packing, renaming and edits.
- A marketplace license that allows shipping in a game may forbid publishing the raw files in a public repo. Keep receipts and license snapshots with personal or account data out of public repos.
- Check each store's current AI-content disclosure rules before submission (Steam asks on its content survey).
- When terms are unclear or the release is commercially important, flag it for a human rights review rather than guessing. This is recordkeeping, not legal advice.
