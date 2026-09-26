# Proposal

## Why

The particle-effect art needs a reusable runtime representation before it is assigned to gameplay events. A developer-facing placement tool will let the team inspect every effect in any realm and world, validate scale and layering, and make production decisions without coupling the art to a particular encounter.

## What Changes

- Add a production particle-effect catalog with stable alphabetical names for the RCArt fire and smoke sequences.
- Copy the particle assets into the project and render them as transparent, grid-anchored overlays above existing world tiles.
- Define per-effect frame sequencing, one-shot behavior, loop metadata, and scale metadata so gameplay can reuse the same runtime API later.
- Support spawning an effect in any realm/world coordinate without replacing or mutating the underlying terrain, glyph, or object tile.
- Add a Windows developer `PFX` launcher under the existing Dev tools.
- Open a draggable, non-modal PFX window using the same interaction model as the Lighting window.
- Show the available effects as an alphabetical text list; selecting an item arms it for placement.
- Keep the PFX window open after placement so repeated world clicks spawn repeated one-shot instances.
- Keep the demo placement controls developer-only; the catalog and renderer remain production-ready for later gameplay callers.

## Capabilities

### New Capabilities

- `particle-effect-rendering`: Production catalog, asset loading, frame playback, grid anchoring, layering, scaling, and realm/world-independent effect spawning.
- `developer-pfx-window`: Developer-only draggable PFX window and click-to-place demo workflow.

### Modified Capabilities

- `developer-corner`: Add the `PFX` launcher to the Windows developer tools while preserving existing Dev behavior.
- `world-view-rendering`: Permit particle overlays to render after world content without changing world-cell composition or tile ownership.

## Impact

- Affected application areas include the copied asset tree, Babylon Lite world-view composition, developer corner/window UI, pointer-to-world coordinate mapping, and render/update lifecycle.
- No new runtime dependency is planned.
- The production renderer must support both game-world and future minimap/mapview callers, while the initial demo placement surface targets the game world only.
- Existing lighting, fog, tile, glyph, and object rendering must remain unchanged except for the addition of an optional particle overlay pass.
- Validation will require focused Node tests, build checks, OpenSpec validation, and manual browser verification of the draggable window and repeated placement behavior.
