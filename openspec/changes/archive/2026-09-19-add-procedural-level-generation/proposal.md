# Proposal

## Why

The starter currently renders a player against an empty canvas, so it has no
world model, terrain, or meaningful movement constraints. This change adds an
explicit-size procedural level so the game can become a playable ASCII world
while preserving a separate character layer for future monsters and objects.

## What Changes

- Add a procedural world generator accepting explicit `rows` and `columns`.
- Generate terrain using a light cellular-automata cave algorithm with a
  configurable wall-fill percentage, smoothing-pass count, and optional
  caller-provided seed.
- Generate and retain a fresh resolved seed whenever the caller does not
  provide one, so each new level is random but can still be reported or reused
  for deterministic reproduction.
- Use `W` for non-walkable walls and `•` for walkable empty terrain, both
  rendered white for now.
- Force the outermost row and column to walls.
- Guarantee a connected walkable region large enough for the player to start
  in it.
- Represent terrain and characters as separate layers and render the
  character layer above terrain when a cell contains `P`.
- Prevent player movement into generated wall cells.

## Capabilities

### New Capabilities

- `procedural-level-generation`: Explicit-size cellular-automata terrain,
  connected playable-region selection, and layered top-most rendering.

### Modified Capabilities

- `player-grid-movement`: Movement must respect the generated terrain's
  walkability while retaining existing keyboard, viewport, and repeat behavior.

## Impact

- Affected application areas include the logical grid model, canvas rendering,
  player movement, and focused unit/browser tests under `ascii-rpg/`.
- No new dependency is required; generation and rendering remain local browser
  logic in the existing React/Vite application.
- The future `add-ascii-palette` change is intentionally separate. It will
  define the reusable character contract for glyph value, color, alpha, and
  walkability; this proposal uses only the temporary `W` and `•` definitions.
