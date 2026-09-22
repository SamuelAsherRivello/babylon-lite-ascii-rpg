# Proposal

## Why

The live app currently renders at 60 FPS while idle, but sustained rapid movement with Shift reproduces drops to 41, 30, 26, and 33 FPS. The regression appeared after the lighting and fog presentation work, so the movement-driven render path needs to be made cheaper without weakening the current lighting, shadow, fog, or minimap appearance.

## What Changes

- Add a movement-render performance contract for the visible game, lighting, GPU light-pass, fog, and minimap pipeline.
- Reduce allocation, duplicate traversal, and redundant sprite/canvas submission work performed during rapid movement.
- Preserve the existing lighting factors, shadow boundaries, fog visibility values, GPU glow colors/falloff, minimap composition, and player-light refresh semantics.
- Keep movement input responsive and coalesce work so rapid Shift movement cannot queue redundant full-frame work.
- Add focused unit coverage for reusable performance helpers and retain manual browser verification for sustained Shift movement and visual parity.

## Capabilities

### New Capabilities

- `movement-render-performance`: Maintains a responsive frame rate during sustained rapid movement while preserving the current visible rendering result.

### Modified Capabilities

None. Existing lighting and fog requirements remain the visual source of truth; this change optimizes their implementation without changing their externally visible semantics.

## Impact

- Affects the Babylon Lite game-layer movement scheduling, visible-region rendering, lighting-field/GPU light-pass submission, fog discovery refresh, and minimap rendering paths under `ascii-rpg/src/client/game-layer-babylon-lite/`.
- Adds focused Node tests for output-equivalence and bounded work where practical; no new dependencies or public bridge commands are required.
- Requires manual browser verification at the configured project URL using sustained Shift movement. The acceptance target is a sampled FPS floor of at least 55 during the stress run, with idle FPS remaining at or near 60.
