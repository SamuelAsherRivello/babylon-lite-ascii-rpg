# Proposal

## Why

The Overground currently lacks friendly living characters, so the generated world has no ambient population or non-combat movement beyond the player. NPC patrols will introduce visible friendly activity while preserving the existing player-driven world clock and combat boundaries.

## What Changes

- Add an Overground-only NPC Spawner System with deterministic, walkable, unoccupied placements controlled by a visible `NPC` Procedural menu pass: Low creates 4, Med creates 8 (the default), and High creates 12; every density includes one within 50 cardinal cells of the player start.
- Show the selected NPC density in the Procedural map preview with prominent NPC-spawner markers, alongside the heart, trap, and torch markers.
- Give each NPC spawner the `☺` glyph and create exactly one nearby walkable NPC immediately during world setup; spawners never create another NPC.
- Add friendly NPC patrol behavior: each NPC pathfinds once at birth to a random reachable waypoint exactly 15 or 20 cardinal steps away, stores its route, walks one stored cardinal step per received tick, then reverses that route home without later pathfinding.
- Extend shared dynamic occupancy so player and NPC cannot share a cell; attempted player movement into an NPC remains blocked and never invokes combat, damage, stamina, experience, logging, or a new tick rule.
- Add `☺` to the editable Ascii Settings palette inventory.
- Preserve the existing world-time producers and tick semantics exactly; NPCs only observe already-broadcast ticks.
- Cull every world graphic by its surface's source region and realm fog before glyph preparation, sprite submission, canvas draw, or marker/overlay work.

## Capabilities

### New Capabilities

- `npc-spawner-system`: Defines friendly NPC spawning, walkable patrol navigation, and non-combat lifecycle behavior.

### Modified Capabilities

- `ascii-palette`: Adds the editable NPC glyph identity to the palette inventory.
- `world-generation-passes`: Adds deterministic Overground NPC-spawner distribution after established terrain and placement layers.
- `procedural-level-generation`: Adds the persistent, clearly labeled NPC Low/Med/High generation control and extends dynamic entity and seed-stable generation requirements to NPC spawners and NPCs.
- `player-grid-movement`: Defines the non-combat blocked collision between the player and a friendly NPC.

## Impact

- Affected systems: world generation, palette inventory, dynamic occupancy, player movement collision, game-layer startup, and game/minimap/map-view rendering.
- New client-side NPC and NPC-spawner system modules and focused Node tests will be needed; no dependencies, network services, saved world migration, or time-system behavior changes are required.
