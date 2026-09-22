# Proposal

## Why

In Camera Lock mode, shifting the visible world at a screen edge can leave a stale `P` in a sprite slot that now represents an undiscovered cell. The slot is skipped by the fog-filtered composition, so the old player glyph remains visible near the edge instead of being removed.

This is user-visible rendering corruption during ordinary movement and should be corrected before further camera or fog changes make the slot lifecycle harder to reason about.

## What Changes

- Make each game-view sprite slot authoritative on every full world render, including slots whose current cells are undiscovered.
- Hide undiscovered or otherwise ineligible slots instead of leaving their previous glyph state visible.
- Preserve the existing fog contract: undiscovered cells still render no world background or glyph.
- Add focused regression coverage for Camera Lock viewport shifts where a previously occupied slot becomes undiscovered.

## Capabilities

### New Capabilities

<!-- None. This fixes behavior already covered by existing capabilities. -->

### Modified Capabilities

- `camera-modes`: Camera Lock movement and screen-edge wrapping must not leave stale player glyphs in the rendered viewport.
- `world-view-rendering`: Full game-view passes must reconcile every visible sprite slot while preserving undiscovered-cell suppression.

## Impact

- Affected client: `ascii-rpg/src/client/game-layer-babylon-lite/index.js` and the visible-region/world-view rendering helpers as needed.
- Affected tests: focused game-layer rendering and camera behavior tests under `ascii-rpg/test/`.
- No public API, dependency, persistence, or deployment changes are expected.
