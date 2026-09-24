# Design

## Context

See proposal.md for the motivation and behavior scope. Babylon Lite owns the character state, input and movement, world-time ticks, terrain, dynamic character occupancy, and world rendering. React receives immutable character snapshots through the bridge. `resolveCharacterContact` currently selects a capability from the character's present inventory for adjacent movement contacts; it does not yet resolve non-directional actions. World time advances on movement and attacks, and time-system tickables receive each world tick in registration order.

The fourth HUD inventory cell is currently empty. Dynamic occupancy reserves one cell for one actor, so a planted bomb cannot claim the cell occupied by the player at deployment.

## Goals / Non-Goals

**Goals:**

- Keep bomb inventory and simulation authoritative in the game layer.
- Resolve SPACE through the existing inventory-capability selection mechanism.
- Use world-time ticks for fuses and blast growth, updating bombs in every realm on every tick.
- Resolve bomb effects before player, enemy, or NPC actions and movement for that tick.
- Render planted bombs and their blast with glyphs already present in the editable palette.
- Keep bombs overlaid on the grid without making them block actors or alter actor occupancy.

**Non-Goals:**

- Add real-time fuse progression while the world clock is stopped.
- Add directional throwing, remote detonation, bomb crafting, pickup, or replenishment.
- Award experience for blast kills or change underground walls and other non-diggable terrain.
- Add a separate inventory framework or external dependency.

## Decisions

### Treat bombs as a stack capability in the fourth inventory slot

Represent the starting stack as a bomb item with a count of 50 in the fourth character slot. This lets the existing inventory-based capability resolver decide whether the player can perform a bomb action and gives the existing HUD a stable location for the count. Extend the resolver's action context so SPACE can request the `bomb` capability without fabricating an adjacent contact; the action succeeds only when the stack is positive. Decrement the stack only after a bomb is successfully registered.

Alternative: keep bomb count outside the character state and introduce an independent ability lookup. That would duplicate inventory selection and require a separate bridge snapshot for the HUD.

### Plant bombs on the player's current cell without taking actor occupancy

Maintain planted bombs in a bomb-specific cell registry, separate from exclusive dynamic character occupancy. A bomb is visible at the player cell once the player leaves. The player and other actors can move over the bomb cell during its fuse. Do not allow more than one planted bomb in a cell; a SPACE action at a cell already containing a bomb fails without spending a bomb.

Use the existing palette glyph `●` for a planted bomb and `✶` for blast cells. These glyphs are already part of the palette, so no palette-inventory change is needed. Render character glyphs above bomb glyphs when they share a cell.

Alternative: put bombs in dynamic character occupancy. That prevents placement at the required player cell and would block movement over bombs.

### Count fuse and blast growth only on world-time ticks

The SPACE placement action advances world time by one. After that action tick is delivered, arm the bomb at the resulting world time; the five subsequent world-time ticks make up its full fuse. For example, planting at time 10 advances time to 11 and starts the fuse there; the bomb begins its radius-one explosion at time 16. The placement tick itself does not reduce the fuse. That detonation tick renders radius one; the next four ticks expand the radius one grid cell at a time until radius five. If the world clock does not advance, fuses and active blasts pause.

Process bomb fuse and blast jobs through the existing tick delivery path, not a wall-clock timer or render-frame callback. Every world-time tick updates bombs in both realms, including the inactive realm; a blast affects only terrain, bombs, and characters in its planted realm. The tick coordinator resolves bomb fuse and blast effects before player, enemy, or NPC movement and other actor actions. A player action that would advance time must first be validated; if the pre-action blast kills the player, the pending movement or attack does not proceed. A blocked action does not start a world-time tick and therefore does not progress bombs.

Alternative: use elapsed real time or render frames. That would make explosions continue while world actions are stopped and would make outcomes depend on frame scheduling.

### Map each blast to a filled Euclidean circle on the grid

For a radius `r`, include grid cells whose squared distance from the bomb cell is at most `r * r`. The expanding front advances one cell per tick, while every cell in the currently active circle remains damaging on each of its five blast ticks. This lets an actor entering an already-expanded cell take damage. Terrain does not occlude the blast, allowing the circular influence to reach and destroy every diggable mountain in range. A destroyed mountain is removed after its first lethal application; living actors remaining in the active circle can take further damage on later ticks.

At a reached cell, destroy an interior Overground mountain by applying enough mountain damage to transition it immediately to the standard walkable grass tile. Remove enemy and NPC spawners from occupancy; unregister a destroyed enemy spawner so it cannot create future enemies. Removing an NPC spawner does not remove the NPC it already created; that NPC is removed only if the blast independently reaches its cell. Remove living enemies and NPCs and unregister their future simulation; apply lethal health damage to the player through the existing player lifecycle. Do not affect unrelated object types.

Alternative: use a square or Manhattan diamond. Those shapes do not match the requested circular expansion. Reapplying blast damage to the entire filled circle on every tick could affect actors repeatedly and does not fit the single expanding-front presentation.

### Chain bombs one tick after blast contact

When a blast first reaches a planted bomb, set its detonation time to the following world-time tick. This overrides its normal remaining fuse but does not detonate it in the same tick. Guard the bomb state so several blasts cannot schedule duplicate detonations.

Alternative: trigger on the same tick. A one-tick delay matches the requested chained timing and keeps each detonation visible as a separate ordered event.

### Apply health damage instead of removing blast targets directly

Use `100` as the bomb's base damage for each newly reached cell. Apply that amount through existing health-damage paths for mountains, enemies, and enemy spawners; their current health is `100`, `40`, and `100`, respectively. Add `100 / 100` health to NPCs and NPC spawners so the same hit can damage and kill them through normal zero-health cleanup. Clamp applied damage to current health, and run existing destruction, tick-unregistration, and presentation callbacks when health reaches zero. Destroying an NPC spawner does not destroy its already-created NPC.

Route player blast damage through the existing Defense and Shield contact path. With Shield equipped, calculate applied player damage using the current Defense ratio and wear Shield by the same final applied damage; player health loses that applied amount as with incoming enemy damage. Without Shield, apply all `100` damage to player health. Raise new-session and maximum player health from `100` to `125`: at full health, the player survives one full `100`-damage blast even with no Defense mitigation, retaining `25` health. At full Defense with Shield, the existing 50% mitigation applies `50` damage to health and Shield.

Alternative: remove characters or spawners directly on blast contact. That would skip their health systems, damage callbacks, Shield durability, and observable health changes.

## Risks / Trade-offs

- [Tick work is being refactored in another active change] → Keep bomb processing as a tick consumer and coordinate the bomb-first phase across player, enemy, and NPC actions with the logical tick coordinator; do not add an independent timer.
- [Existing player movement advances time after moving] → Prevalidate time-consuming player actions, then resolve the bomb phase before committing actor movement while preserving the rule that blocked movement does not advance time.
- [Character HUD slot shape currently represents durable equipment] → Permit the fourth slot's stack item to omit health and publish its count through the existing immutable character snapshot; retain the existing health bar behavior only for durable equipment.
- [NPCs and NPC spawners currently have no health] → Add `100 / 100` health and bomb-damage cleanup while leaving their non-combat and one-time spawn behavior unchanged.
- [Bomb damage can otherwise kill a full-health player in one hit] → Set player starting and maximum health to `125`, and apply the existing Defense/Shield calculation before player health changes.
- [A radius-five blast may touch many cells] → Resolve only the newly reached ring per tick and invalidate only affected render cells while keeping the authoritative terrain and actor updates in the game layer.
- [Glyphs may be customized in the palette] → Use the shared palette renderer for bomb and blast glyph styling, with a distinct blast color supplied by the bomb presentation.

## Migration Plan

No persisted character save migration is needed because gameplay sessions initialize fresh character state. Add bomb count to the initial state and bridge snapshot, then wire the inventory action, bomb registry, tick simulation, terrain and actor effects, and rendering. If bomb actions or tick ordering need rollback, remove the bomb capability and registry and retain the existing movement, inventory equipment, and time paths unchanged.
