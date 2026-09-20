# Design

## Context

The game layer already owns the minimap canvas, fog-of-war state, world model, marker ordering, palette state, and minimap content zoom. The current `getMinimapWorldPixel` path averages discovered 10-by-10 regions into a single color, which produces the grey documentation-like appearance the new proposal replaces. The main game renderer resolves each world cell through `getVisibleGlyph`, palette colors, and the glyph visual cache.

## Goals / Non-Goals

**Goals:**

- Make the minimap a recognizable miniature of the actual discovered game world.
- Reuse the established world glyph and palette resolution rather than inventing a second terrain vocabulary.
- Keep world rendering separate from marker rendering so marker depth remains deterministic.
- Preserve fixed canvas bounds, fog behavior, minimap zoom persistence, and game zoom isolation.

**Non-Goals:**

- Rendering Babylon sprite atlases or the full-resolution game viewport inside the minimap.
- Changing world generation, fog discovery rules, marker definitions, or the player/game camera.
- Adding a visible minimap zoom label or another control.

## Decisions

### Render resolved world cells directly into the minimap canvas

For each source cell in the selected minimap viewport, resolve the same visible glyph and palette color used by the game renderer, then draw a compact glyph/colored cell into the 2D minimap canvas. This preserves recognizable terrain and object identity without coupling the canvas to Babylon's sprite-layer lifecycle. The prior aggregate color reducer is removed from the minimap draw path; it remains available only if another consumer requires it.

### Keep fog as a render gate

Before drawing a source cell, consult the existing discovery state. Undiscovered cells remain the minimap background, while partially discovered coarse regions may show only the individually discovered source cells. This avoids leaking world layout while improving fidelity for known areas.

### Use explicit background, glyph, and marker passes

The render function clears and paints the world background first, paints the resolved world glyphs second, then paints markers transformed into the same minimap viewport. Marker clipping and order remain explicit, with the player last. This makes pass ordering and overlap behavior testable and prevents later world drawing from obscuring navigation cues.

### Preserve the existing zoom contract

The current `[1, 5, 10]` content zoom selects a smaller player-centered source viewport and expands it into the same canvas dimensions. No CSS transform or game zoom call is introduced.

## Risks / Trade-offs

- [Glyph text in a small canvas can be less crisp than the Babylon sprite atlas] → Use the existing pixel-preserving canvas styling, compact font settings, and focused browser verification at each minimap zoom.
- [Drawing many source cells may cost more than one aggregate pixel per coarse region] → Bound work to the selected viewport, skip undiscovered cells, and verify render timing with the existing world-scale test fixture.
- [Palette or visible-glyph changes could diverge if duplicated] → Call the established world glyph and palette helpers rather than maintaining minimap-specific color tables.

## Migration Plan

No data migration is required. Existing minimap zoom local storage remains valid. Rollback restores the prior minimap draw implementation without changing world, fog, marker, or game zoom state.
