# Proposal

## Why

Enemies currently pursue and attack the player, while NPCs can follow the player but are not yet meaningful combat participants. When an enemy and NPC share a realm, the enemy should create a readable threat to the nearest living character and NPC health should provide a survivable, observable outcome.

## What Changes

- Extend enemy target selection to consider living same-realm NPCs and the player.
- Make enemy pursuit and adjacent attacks use the nearest reachable target, with deterministic tie-breaking.
- Preserve NPC follow behavior; NPCs do not attack the player as part of this change.
- Apply the existing enemy attack damage to NPC health and retain the existing player-driven tick cadence.
- Resolve NPC death at zero health so the NPC stops acting and is no longer a valid enemy target.
- Add focused tests for target selection, pursuit, NPC attacks, target switching, and NPC death, plus manual browser verification.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `enemy-system`: enemies can pursue and attack the nearest living same-realm NPC or player instead of targeting only the player.
- `npc-spawner-system`: spawned and recruited NPCs participate in health, damage, and death state transitions while retaining follow/patrol behavior.

## Impact

The change affects the Babylon Lite enemy and NPC systems, dynamic occupancy target queries, combat/log event wiring, and focused Node tests. It uses existing health-bar rendering, damage callbacks, navigation, time dispatch, and occupancy APIs. No new dependencies, timers, renderer replacement, persistence, or React-owned gameplay state are planned.
