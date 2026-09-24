# Proposal

## Why

Stepping into a cardinally adjacent treasure chest currently requires an extra input before the chest opens, even when the attempted move is not a combat action. Opened chests must also reliably place their guaranteed heart in a genuinely free neighboring cell.

## What Changes

- Ensure a cardinal movement attempt that reaches a non-combat chest opens it on that same input.
- Require the guaranteed heart reward to use one of the eight surrounding cells that is walkable and unoccupied by the player or any active object.
- Add regression coverage for first-step opening and complete neighboring-cell occupancy checks.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `object-spawner-system`: clarify chest interaction timing and guaranteed heart placement constraints.

## Impact

Affected runtime movement integration and object spawning logic under `ascii-rpg/src/client/game-layer-babylon-lite/`, plus focused Node tests. No new dependencies or public APIs.
