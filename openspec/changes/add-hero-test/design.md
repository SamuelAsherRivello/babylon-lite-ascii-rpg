# Design

## Context

See proposal.md and the hero-sprite-animation-test spec. The selected source frames are 32×48 PNGs under `ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/Characters/Hero_Warrior`, while the world remains a 16×16 logical grid.

## Goals / Non-Goals

**Goals:**

- Exercise the complete hero animation set in the live game view.
- Keep the visual sprite larger than one cell while retaining one-cell gameplay semantics.
- Make death a persistent, inert visual state for this test.

**Non-Goals:**

- Enemy or NPC sprite replacement.
- New character art, Tiled runtime loading, or a new animation dependency.
- Minimap sprite replacement or a final art-scale decision for the whole game.

## Decisions

- Use the existing side-facing strips/frames rather than rotating or mirroring the source art at runtime. This preserves the creator's authored pose and keeps the test deterministic.
- Render the native 32×48 artwork at a display size that is approximately two grid cells wide and three cells tall, anchored at the feet. This preserves detail while making the one-cell gameplay footprint explicit.
- Keep animation selection driven by gameplay state: stationary, moving, attacking, and dead. A completed death animation freezes on its final frame.
- Preserve the current glyph path as a fallback when the raster asset is unavailable or the test is disabled.

## Risks / Trade-offs

- [Risk] The sprite visually overlaps nearby cells. → Keep collision and occupancy anchored to the single base cell and validate movement around walls and actors.
- [Risk] The current player death lifecycle may remove or disable the entity immediately. → Separate visual corpse persistence from active simulation and stop updates after death.
- [Risk] Native art may read too large at some viewport scales. → Make the display scale a single test constant so it can be adjusted after the user's browser playtest.
