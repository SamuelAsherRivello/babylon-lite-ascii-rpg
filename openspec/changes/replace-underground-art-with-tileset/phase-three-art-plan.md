# Phase 3 — art refactor and composition scaling (plan only)

## Scope and ownership

Do not implement this migration until separately authorized. Keep all supplied
folders in `ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/`; other
systems may use them. Preserve original PNGs and Tiled relative references.
Place our manifests, recipes, and generated outputs outside vendor originals.
Use BASE_URL-safe project URLs, never developer-machine links.

Inventory every logical world visual before selecting replacement art:

| Category | Required coverage / source candidates |
| --- | --- |
| Terrain | Underground wall/floor; Overground mountain/grass/dirt; water depths and transitions; Tilesets |
| Actors | Player, enemy types, NPCs and spawners; facing, idle/move/action/death; Characters and Enemies |
| Props | Torches, camp fires, stairs, fences, doors with orientation and open/closed states; Props and Tilesets |
| Interactables | Chests open/closed, keys, gold, health, traps; Items and Props |
| Effects | Existing particle effects and animated liquids/flames; retain current effect system ownership |
| UI/maps | Markers, labels, inventory icons and fallback glyphs; explicit low-resolution map representations |

Inventory is not a claim that the pack supplies every role. Record missing art
and retain glyph fallbacks rather than forcing a visually incorrect substitute.
Existing actor-art work is an integration input, not permission to replace it.

## Shared art contract

Introduce stable logical art IDs independent of glyphs or sheet coordinates.
Manifest entries describe source image/frame, dimensions, pivot, cell footprint,
realm, states, facing, animation timing, draw order, minimap representation,
fallback, and provenance. Keep collision and interaction in logical world data.
Validate frame bounds and required states; version recipes and manifests.

Separate terrain from actors/props/overlay glyphs at rendering time. Today's
terrain-plus-overlay cache is convenient for the experiment but scales as a
cross-product. Target storage proportional to terrain variants + actor frames +
prop states, not terrain variants multiplied by every possible overlay.
Maintain ordering, fog, source transparency, and the accepted PNG lighting rule.

## Composition strategy

Keep composition a pure declarative operation: source rectangles, destinations,
layer order, and optional explicitly audited transforms. Validate every mask;
generate a contact sheet and seam fixtures from the same runtime recipe.
Never rotate directionally lit art without visual qualification.

For this experiment, sixteen lazy cached recipes are sufficient. For many
families, prefer build-time baking into versioned atlases and runtime UV lookup.
Use source-content plus recipe-version hashes for reproducibility/invalidation.
Runtime composition remains an option for truly dynamic skins, done once per
variant, never per visible cell per frame. Do not build an unbounded texture for
each world coordinate, fog value, light value, or overlay combination.

Sixteen 32x32 RGBA frames cost 64 KiB raw; 47 cost about 188 KiB, excluding
padding, mipmaps, decoded sources, and GPU duplication. Zoom-specific copies and
overlay combinations dominate quickly. Profile current caches (135 reserved
slots and up to ten retained zoom caches) before extending them. Prefer a shared
native-resolution atlas with nearest-neighbor sampling where the renderer permits;
otherwise use byte-budgeted LRU caches. Split atlas pages at device texture limits.

Retain visible/discovered-cell submission and scrolling caches. Expand terrain
invalidation by one cell before view culling; invalidate recipe/atlas versions
explicitly. Never scan or rasterize the whole world because one wall changed.
Track cold/warm generation time, rasterizations, atlas bytes/pages, cache misses,
visible sprite count, and frame time in game, minimap, and expanded map views.

47-tile fidelity is a later art decision: author or qualify consistent diagonal
inner corners, possibly through quarter composition, then cover all normalized
patterns. Five source pieces do not inherently mean five-tile fidelity; our five
pieces produce sixteen cardinal outputs. More masks cannot repair unsuitable art.

## Proposed migration order and gates

1. Catalog current art/glyph roles and introduce the manifest adapter without
   changing appearance. Test missing-art fallback and public URL resolution.
2. Separate static terrain from overlays while retaining the approved wall/floor
   result. Compare fog, lighting, facing, map parity, atlas bounds, and memory.
3. Migrate props and interactable states in small reviewed groups. Verify actual
   chest opening, collection, doors, stairs, and terrain blocking.
4. Integrate actor animation/facing with existing actor work; review combat,
   movement, death and overlap rather than merely sprite-sheet loading.
5. Qualify liquids, effects, and Overground art separately. Do not infer approval
   to replace UI glyphs; review their readability as a separate category.

Each group needs deterministic Node checks, build, fixed-seed playable review,
and human acceptance. Test all source bounds/masks, alpha and seams, diagonal
limits, terrain edits, borders, zooms and the in-game Aspect modes. Measure
performance before/after at matching seeds and view sizes. No bulk art migration
or new asset dependency is authorized by this planning deliverable.
