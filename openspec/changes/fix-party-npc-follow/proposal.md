# Proposal

## Why

The current recruited-NPC follow logic is embedded in the NPC system, making it difficult to reuse and leaving building-boundary transitions undefined. A recruited NPC should consume a portable follow behavior whose target is the player and whose navigation adapter can route through doors, stairs, and other boundaries.

## What Changes

- Extract a portable follow behavior that accepts a follower, a target, movement/collision adapters, and optional navigation transitions.
- Configure recruited NPCs as one consumer of that behavior, following the player at a valid 3–5-cell trailing distance.
- Recalculate the companion's target as the player moves or turns, while respecting terrain and dynamic occupancy.
- Route through the player's building door when the player is inside and the companion is outside, and symmetrically when the player exits.
- When two or more followers share a target, prefer valid positions with at least one empty grid cell between followers when the map allows it, while accepting closer valid positions when space is constrained.
- Preserve recruited party NPC instances when the player enters stairs and a new realm loads.
- After the next realm loads, place each preserved party NPC on the nearest valid, unoccupied cell to the arrival stairs, prioritizing cells 3–5 cardinal units from the player when possible, then resume normal follow behavior.
- Keep unrecruited NPC patrol behavior, existing player-driven tick cadence, combat/contact rules, and realm boundaries unchanged.
- Add focused unit coverage for recruitment, following while the player moves and turns, blocked trailing cells, realm transitions, random nearby placement, and the 3–5-unit distance contract.
- Add manual browser verification of the actual party dialog flow, stair transition, and visible companion movement in the new realm.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `follow-behavior`: portable target-following movement with bounded distance, collision-safe replanning, and navigation-transition support.
- `npc-spawner-system`: recruited NPCs configure and consume the follow behavior with the player as target.

## Impact

The change affects the Babylon Lite follow behavior, NPC configuration, building navigation metadata, realm-transition handoff, dynamic occupancy, and focused behavior/NPC tests. It uses the existing player state, realm loading, world walkability, occupancy, and player-driven update loop; no new dependencies, persistence, UI, or renderer APIs are required.
