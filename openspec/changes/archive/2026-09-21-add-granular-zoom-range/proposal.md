# Proposal

## Why

The current integer zoom range of 1–10 provides ten coarse steps, but its lowest step is not far enough out for the intended exploration view. This change keeps exactly ten user-facing steps while remapping the endpoints and distributing the intermediate steps multiplicatively.

The proposed scale is linearly spaced by nominal value: proposed zoom 1 represents 0.1× the current zoom-1 scale, proposed zoom 10 represents the current zoom-10 scale, and proposed zooms 2–9 evenly distribute the additive range between those endpoints. Each step adds `1.1` effective zoom units.

## What Changes

- Keep exactly ten persisted and user-controlled zoom values, displayed as 1–10.
- Map displayed zoom 1 to 0.1× the current zoom-1 scale and displayed zoom 10 to the current zoom-10 scale.
- Map displayed zooms 2–9 with equal additive spacing between those endpoint scales.
- Convert each platform's existing default through the same mapping, rounding to the nearest new displayed value, so the first-render experience remains visually equivalent on PC and mobile. The converted default—not the old numeric label—becomes the new persisted/default selection.
- Migrate saved game-zoom values through the same mapping so existing users retain approximately the same effective view while the ten displayed values use the new scale through `+` and `-`.
- Map the minimap's existing scale states to equivalent new scale states (including its initial/default state) so minimap content size and coverage feel unchanged at first render. Keep minimap scale interaction independent from game zoom and preserve its existing persistence and hidden numeric presentation.
- Update camera, viewport, glyph-cache, culling, and performance checks for the ten remapped values and fractional effective scales.
- Validate that far zooms clamp correctly at the existing world boundary and do not require automatic world expansion.
- Treat world expansion as optional follow-up work: the current runtime already generates a 512×512 world, but the proposal must measure whether far zoom exposes undesirable edge clipping, sparse content, or performance costs before changing world dimensions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `zoom-levels`: Change the ten-level mapping, linear nominal spacing, device-default migration, saved-value migration, minimap-equivalent mapping, and camera behavior across displayed zooms 1–10.
- `zoomed-glyph-rendering`: Support fractional effective render scales, cache keys, visible-region culling, and performance validation across the remapped ten-level range.
- `player-grid-movement`: Update viewport-size examples and world-boundary behavior for the new farthest effective zoom.

## Impact

The primary affected areas are the React Settings zoom control and local-storage normalization, the Babylon Lite viewport constants and scale calculation, camera-origin recalculation, glyph raster sizing/cache keys, visible-region rendering, and focused Node tests. No new dependency is expected. The farthest zoom exposes approximately 10× as many cells per dimension versus current zoom 1, or about 100× the visible area, so lighting, culling, glyph submission, and memory budgets must be measured. The existing 512×512 generated world should be retained unless verification demonstrates that its boundaries are too close for the intended far-zoom experience.
