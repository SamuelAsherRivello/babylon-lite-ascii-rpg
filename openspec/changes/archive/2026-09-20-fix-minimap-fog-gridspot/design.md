# Design

## Context

The minimap renderer already uses the fog-of-war system's exact-cell discovery predicate for terrain graphics and torch markers. Its origin and player marker collection currently bypasses that predicate, while the game layer consumes the returned marker list unchanged. See `proposal.md` and the modified `minimap-markers` spec for the intended behavior.

## Goals / Non-Goals

**Goals:**

- Make marker eligibility use the same exact world-gridspot discovery rule for origin, torch, and player markers.
- Preserve marker ordering, colors, exact-cell mapping, and rendering ownership.
- Keep fog discovery independent from configurable lighting profiles, using a fixed 20-gridspot line-of-sight radius.
- Add regression tests that distinguish exact-cell discovery from partial coarse-area discovery.

**Non-Goals:**

- Do not change fog discovery radius, persistence, world generation, minimap zoom, canvas layout, or marker colors/depths.
- Do not move fog logic into the React UI or alter the game-layer rendering loop.

## Decisions

1. Apply the existing `isDiscovered(fog, world, cell)` predicate at marker collection time. This keeps fog ownership in the fog-of-war system and prevents hidden marker data from reaching the renderer. Checking only coarse minimap coverage was rejected because partial discovery must not reveal a specific gridspot.
2. Gate the origin and player markers independently, just as torch markers are gated. This preserves valid cases where one marker is visible while another remains fogged and avoids adding special-case state to the game layer.
3. Return and render marker coordinates in exact world-gridspot units, matching the per-gridspot world glyph pass. Coarse 10 by 10 mapping was rejected because it can place a marker away from the glyph it describes.
4. Use `fogUnclearRadius` as the sole player discovery radius and retain `hasClearLightPath` as the line-of-sight gate. The lighting profile was rejected because changing visual light settings must not unexpectedly reveal more map.
5. Extend the existing minimap renderer unit tests rather than adding browser automation. The repository already has direct tests for marker composition and exact torch discovery, and project guidance limits Playwright work unless explicitly requested.

## Risks / Trade-offs

- [Risk] Existing players may no longer see the origin/player dot while its exact gridspot is fogged → This is the intentional behavior change specified by the user; discovery of that gridspot makes the marker appear on the next minimap render.
- [Risk] A marker can disappear when movement enters an undiscovered gridspot → The player remains represented by the world/game state, while the minimap correctly avoids leaking fogged location information.

## Migration Plan

No data migration is required. Update the renderer and focused tests, then ship through the existing Vite build path. Rollback consists of reverting the scoped implementation and test changes if the fog contract is intentionally changed again.
