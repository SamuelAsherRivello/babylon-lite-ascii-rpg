# Proposal

## Why

An NPC that accepts the player's party invitation currently remains behind instead of behaving as a companion. This makes the party interaction appear successful while failing its expected gameplay outcome: the recruited NPC should travel with the player at a small, readable trailing distance.

## What Changes

- Make a recruited party NPC pursue a valid walkable cell 3–5 cardinal units behind the player, using the player's current facing when selecting the preferred trailing position.
- Update the recruited companion every game/render frame when it is farther than 5 gridspots away, so it moves toward the player quickly enough to maintain the requested close spacing.
- Recalculate the companion's target as the player moves, while respecting terrain and dynamic occupancy so the NPC never overlaps the player or another actor.
- Preserve recruited party NPC instances when the player enters stairs and a new realm loads.
- After the next realm loads, place each preserved party NPC on the nearest valid, unoccupied cell to the arrival stairs, prioritizing cells 3–5 cardinal units from the player when possible, then resume normal follow behavior.
- Keep unrecruited NPC patrol behavior, existing player-driven tick cadence, combat/contact rules, and realm boundaries unchanged.
- Add focused unit coverage for recruitment, following while the player moves and turns, blocked trailing cells, realm transitions, random nearby placement, and the 3–5-unit distance contract.
- Add manual browser verification of the actual party dialog flow, stair transition, and visible companion movement in the new realm.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `npc-spawner-system`: recruited NPCs gain a party-following behavior with a bounded trailing distance and collision-safe target selection.

## Impact

The change affects the Babylon Lite NPC simulation, realm-transition handoff, and dynamic-occupancy movement path, plus the focused NPC tests. It uses the existing player state, realm loading, world walkability, occupancy, and player-driven time system; no new dependencies, persistence, UI, or renderer APIs are required.
