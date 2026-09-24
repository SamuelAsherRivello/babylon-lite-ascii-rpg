# Design

## Context

See proposal.md - Why. The enemy system already owns enemy cadence, navigation, adjacent player attacks, and enemy health. The NPC system already owns NPC registration, player-driven patrol/follow updates, health, and removal. Dynamic occupancy is authoritative for single-cell character placement, while the Babylon Lite game layer wires systems together.

## Goals / Non-Goals

**Goals:**

- Centralize enemy target selection at the enemy simulation boundary.
- Select living same-realm NPCs and the player using reachable cardinal path distance.
- Reuse existing enemy damage, NPC health, log, occupancy, and tick interfaces.
- Preserve NPC follow/patrol behavior and the existing player-driven time model.

**Non-Goals:**

- NPC attacks, NPC-vs-NPC combat, ranged combat, factions, aggro memory, or threat tables.
- New timers, independent logical ticks, React-owned combat state, or new dependencies.
- Changes to enemy spawning, player attack rules, or cross-realm pursuit.

## Decisions

- **Target selection uses reachable path distance.** Manhattan distance is fast but can select a target behind walls. Existing cardinal navigation utilities provide the correct gameplay distance and deterministic routes. If multiple targets have the same reachable distance, prefer the player, then sort NPC ids stably.
- **Target selection is recalculated on each eligible enemy action.** This makes the nearest-target rule observable and avoids stale aggro state. Persisting an aggro target was considered but would violate the requested nearest-target behavior when the player or NPC moves.
- **Enemy damage remains enemy-owned, while NPC death remains NPC-owned.** The enemy system requests damage through the existing injected callback; the NPC system clamps health, unregisters its tickable, and removes the dead NPC from occupancy. This preserves layer boundaries and prevents enemy code from mutating NPC records directly.
- **NPCs are removed at zero health.** Existing NPC bomb-death behavior already uses removal and unregisters future ticks; retaining that contract avoids a dead occupancy blocker and prevents dead actors from being targetable.
- **All living same-realm NPCs are eligible, recruited or ambient.** The requirement is about spatial interactivity, not party membership. Dead or absent NPC records are excluded.

## Risks / Trade-offs

- [Risk] Rebuilding path distance fields for every enemy target can increase tick cost in dense worlds. -> Mitigation: reuse the existing navigation revision and distance-field caching strategy, and keep target evaluation bounded to living same-realm actors.
- [Risk] Removing an NPC can invalidate a cached target during an enemy tick. -> Mitigation: resolve the target immediately before attack and route all damage through the NPC system's validated callback.
- [Risk] Several enemies may select the same NPC. -> Mitigation: keep exclusive occupancy and deterministic per-enemy simulation order; attacks remain one action per eligible enemy tick.

## Migration Plan

No data migration is required. Implement the target-selection and damage wiring, add focused tests, run the repository test/build checks, validate the OpenSpec change, and manually verify a seeded browser scene with an enemy and NPC in the same realm.
