# Design

## Context

See proposal.md for motivation and the procedural-level-generation delta for the user-visible contract. The game currently submits glyph sprites through the Babylon Lite renderer and uses `#pfx_overlay` for the hero's animated DOM image. `trap1_strip.png` is an existing project-local 224×32 strip containing seven 32×32 frames. Traps are sparse, persistent, walkable objects that currently present as a `☠` glyph.

## Goals / Non-Goals

**Goals:**

- Replace only the eligible game-view Trap glyph with correctly anchored, pixelated animated artwork.
- Drive all visible Trap overlays with one lifecycle-managed animation clock and never reintroduce the legacy glyph.
- Keep the game renderer's terrain/object semantics and existing world-object systems authoritative.

**Non-Goals:**

- Changing Trap generation, collision, health damage, logging, minimap markers, preview symbols, or lighting rules.
- Replacing artwork for Hearts, Chests, Torches, NPCs, enemies, or other world graphics.
- Adding a rendering or animation dependency, user setting, or new asset.

## Decisions

- Use `trap1_strip.png` as a CSS-background sprite strip rather than seven independently loaded frame images. Background positioning selects one 32×32 frame while retaining a single asset request per overlay.
- Maintain a pooled overlay collection keyed by eligible visible Trap identity, reusing elements across renders. A separate element per visible Trap is needed because its screen anchor follows a distinct grid cell; a single shared element, like the hero overlay, cannot represent multiple traps.
- Advance all visible Trap overlays from one `requestAnimationFrame` schedule and derive the same frame index from elapsed time. This produces a deterministic synchronized loop, avoids per-Trap timers, and permits the loop to stop when no eligible overlays remain. A 120 ms frame duration is the initial implementation value, selected to keep the seven-frame cycle legible without adding an exposed setting.
- During cell presentation, suppress the legacy glyph for every eligible active Trap cell regardless of asset load state. Render an overlay only while the strip is available; off-region and fogged cells remain unpresented.
- Anchor each 32×32 image bottom-center to the same rendered cell geometry used by the hero overlay, allowing it to extend above its 16×16 logical footprint without altering gameplay coordinates.

## Risks / Trade-offs

- [Risk] DOM overlays can drift from the canvas after a camera, zoom, or aspect update. → Recompute overlay position whenever the visible region is rendered and on the shared animation frame while overlays are active.
- [Risk] Animating offscreen or fogged traps wastes frame work and could leak overlays. → Reconcile the overlay pool to the active source region and positive fog visibility on every game-view render, and cancel the animation frame when the pool is empty or the game is disposed.
- [Risk] An asset error could make traps invisible. → Keep the logical Trap and gameplay behavior intact, but do not render a glyph fallback; the cell remains without Trap art until the strip is available.
- [Risk] Overlay art could obscure nearby cells. → Anchor it bottom-center over its one-cell Trap base and preserve the logical renderer/object layers underneath.

## Migration Plan

1. Add the visual overlay path behind the existing Trap object identity without retaining a glyph fallback.
2. Verify focused renderer behavior, the standard Node suite, and a seeded manual game session with visible Overground and Underground traps.
3. Roll back by removing the overlay path; the logical Trap behavior remains unchanged, but no legacy Trap glyph is restored by this change.
