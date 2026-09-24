# Proposal

## Why

Give players a limited-use way to clear diggable Overground mountains and damage nearby characters with a timed area blast. Bombs add a tactical choice: place one at the player’s current cell, then move away before it detonates.

## What Changes

- Add a stackable bomb item with a starting count of 50 for each new gameplay session.
- Let SPACE place one bomb at the player’s current grid cell through the existing inventory-capability action resolution.
- Make bomb placement consume one world-time tick, then detonate the bomb after five additional world-time ticks. Each detonation expands a circular grid-cell blast by one cell per tick until it reaches radius five.
- Advance planted bombs on every world-time tick in every realm, and resolve blast effects before player, enemy, or NPC movement/actions for that tick.
- Apply 100 health damage to blast-reached targets, killing full-health enemies, mountains, and 100-health spawners/NPCs. Give NPCs and NPC spawners 100 health, and raise player starting/maximum health to 125 so a full-health player survives one 100-damage hit even without Defense mitigation.
- Route player blast damage through Defense and Shield durability, then use existing health/death behavior. A bomb reached by another blast begins its own detonation one tick later, independent of its remaining fuse.
- Show the remaining bomb count in the currently empty fourth character inventory slot.

## Capabilities

### New Capabilities

- `bombs`: Stack inventory, SPACE placement, fuse timing, expanding explosions, terrain and character effects, and chained detonations.

### Modified Capabilities

- `character-info`: Show the starting and remaining bomb stack in the fourth inventory cell.
- `combat-stats`: Preserve existing stamina-derived Offense/Defense while documenting the bomb-safety health increase and blast Defense/Shield damage.
- `npc-spawner-system`: Add health and bomb-damage/death behavior to NPCs and NPC spawners.
- `player-lifecycle`: Set new-session starting and maximum health to 125 so a full-health player survives one 100-damage hit.
- `combat-stats`: Preserve stamina-derived combat stats while adding the bomb-safety health maximum and applying the existing Defense/Shield damage calculation to blasts.
- `npc-spawner-system`: Give NPCs and NPC spawners health and allow bomb damage to kill them while preserving the NPC-spawner lifecycle.
- `player-lifecycle`: Set new-session starting and maximum health to 125 so a full-health player can survive one maximum bomb hit.

## Impact

The game layer will own bomb inventory, placement, fuse and blast simulation, terrain changes, entity damage/death, and bomb rendering. The existing item-capability resolver, health/death systems, Defense/Shield path, and world-time tick system are the integration points. The React character panel will display the bomb stack through the existing character-state snapshot and fourth slot. No new dependency or renderer is planned.
