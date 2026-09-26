# Design

## Context

See proposal.md and the animated-torch-presentation specification. The current
game view submits only the active visible region to Babylon Lite. The completed
hero test already establishes a game-layer-owned DOM overlay pattern above the
canvas, while the existing Torch remains a catalog-backed object whose glyph,
position, collision behavior, and lighting source are independent of its
presentation.

## Goals / Non-Goals

**Goals:**

- Render `torch_strip.png` as an anchored three-frame loop only where a Torch
  is eligible for the active game view.
- Keep the visible-set animator continuously looping whenever eligible Torches
  are present.
- Reconcile overlays on world render, camera movement, zoom, resize, fog, realm
  transition, and disposal without stale Torch artwork.

**Non-Goals:**

- A user-facing animation setting, persisted preference, React state, or bridge
  API.
- Changes to Torch generation, density, collision, object consequences,
  lighting calculations, minimap/mapview presentation, or static glyph cache
  semantics.
- Replacing other object glyphs or generalizing a new actor animation framework.

## Decisions

### Use a game-layer-owned visible Torch overlay set

Maintain a keyed overlay record only for active-realm Torches whose cells are
inside the game-view source region and pass fog eligibility. Reconcile that set
after each game-view render: create or update eligible entries, and remove or
hide every stale entry. This makes offscreen Torch animation work absent rather
than merely invisible.

The overlay is game-layer owned, colocated with the existing hero/PFX
presentation container; React receives no world coordinates or animator state.
This follows the current layered presentation boundary. An alternative of
registering every world Torch with a renderer-wide animation manager was
rejected because visibility masking would not by itself prevent per-frame CPU
animation updates for offscreen entries.

### Use the strip directly and advance one shared visible-set clock

Each active overlay uses `torch_strip.png` as a three-frame horizontal strip,
with frame selection by background offset. A single game-layer animation clock
advances the visible set rather than a requestAnimationFrame callback per
Torch. The clock is scheduled only while the set is nonempty.

On re-entry, a Torch derives its frame from the shared elapsed clock rather
than restarting at frame zero. This prevents camera movement from synchronizing
or visibly restarting all Torches. Pre-sliced frame files were considered but
rejected because the strip is the requested supplied artwork and direct strip
use avoids a separate asset mapping.

### Always use authored artwork and preserve existing cell responsibilities

The normal cell renderer continues to resolve Torch identity, terrain, fog,
lighting, and gameplay state. It suppresses the main game-view Torch glyph
beneath the overlay for every eligible Torch, with no static-glyph fallback.
Minimap and mapview keep their existing catalog-glyph/marker paths.

## Risks / Trade-offs

- [Risk] A viewport, fog, or realm transition leaves a stale overlay at an old
  screen position. -> Reconcile against the current source region after every
  relevant game-view render and clear all records during disposal.
- [Risk] The underlying glyph shows below the raster. -> Suppress the glyph
  whenever a Torch belongs to the eligible overlay set.
- [Risk] Many independent callbacks cause avoidable frame work. -> Use one
  visible-set clock and schedule it only for nonempty records.
- [Risk] The animated visual obscures cell semantics at small zooms. -> Keep
  dimensions tied to current grid geometry and include manual fixed-seed
  verification at zooms 1, 5, and 10.
