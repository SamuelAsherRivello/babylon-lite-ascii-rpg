# Design

## Context

See `proposal.md` for motivation and the change specs for behavior. Babylon Lite currently keeps authoritative world, player movement, object collision, player health, time, logging, fog, and rendering in `ascii-rpg/src/client/game-layer-babylon-lite/index.js` and sibling systems. World time starts at `1` and presently exposes only value subscriptions; successful movement increments it. Static visible occupancy is written into `world.characters`, while terrain and objects remain in separate records. The renderer is request-driven through Babylon Lite sprite layers and `requestAnimationFrame` presentation.

The active `add-stamina-concept` change also modifies movement-driven time behavior. Its stamina recovery is tied specifically to successful movement, whereas this change makes combat another time-consuming action. The implementation must preserve that distinction by carrying an action cause with each tick rather than treating every tick as stamina-producing movement.

## Goals / Non-Goals

**Goals:**

- Establish a reusable tickable-entity lifecycle that can later include NPCs and additional character types.
- Keep deterministic simulation independent from visibility, camera, and active realm.
- Keep static objects, dynamic occupants, and terrain independently queryable.
- Resolve player/entity and enemy/player combat through exclusive-cell collision.
- Render short-lived health feedback without exposing mutable gameplay state to React.
- Preserve deterministic world generation and existing realm, object, civilization, fog, lighting, minimap, and bridge behavior.

**Non-Goals:**

- Enemy loot, experience rewards, offense/defense statistics, equipment, ranged attacks, or multiple enemy types.
- Spawner attacks, movement, regeneration, repair, or resurrection.
- Cross-realm pursuit, stair use by enemies, persistence across page reloads, or multiplayer synchronization.
- A global enemy-count cap, despawn distance, encounter director, or difficulty scaling.
- An in-world player health bar; the existing Character HUD remains authoritative.
- React-owned entity state, pathfinding, combat, or health-bar animation.

## Decisions

### Time System publishes structured deterministic ticks

Extend the Time System with tickable registration and immutable tick events containing at least `time` and `cause`. Registration uses stable entity IDs and deterministic insertion order. Each advance snapshots the current registry before dispatch so an entity created during time `31` is born at `31` but receives its first ordinary broadcast at `32`; an entity removed during dispatch receives no later ticks. Session startup performs one explicit current-time dispatch at time `1` after initial spawners are registered, without incrementing the HUD time.

Player movement advances with cause `movement`; collision attacks advance with cause `combat`; any existing non-step time advance uses its own explicit cause. This lets future or concurrent systems such as stamina react only to the causes they own while every enemy and spawner still sees every tick.

An alternative global event bus was rejected because Time System ordering and birth semantics need one authoritative boundary. Directly iterating enemies from the movement handler was rejected because it would omit inactive realms and future tickable types.

### Enemy Spawner and Enemy remain separate systems

Add `enemy-spawner-system.js` for deterministic placement, scheduled creation, spawner health, and permanent shutdown. Add `enemy-system.js` for enemy records, birth/age checks, movement, combat, health, and death. Both systems register their active entities with Time System and publish gameplay/log events through the existing game-layer event boundaries.

Enemy spawners are not added to `object_data.json`: unlike static objects, they have health, receive ticks, create actors, and permanently unregister. Keeping them in the Object Spawner System would mix static item consequences with autonomous entity lifecycle.

### Dynamic occupancy uses a realm-local index

Each realm receives a dynamic-occupancy index keyed by `x,y`, storing player, enemy, and enemy-spawner identity. Terrain, `world.objects`, civilization groups, and dynamic occupants remain separate. Movement and spawning query one shared occupancy helper before mutation. The visible-glyph resolver composes precedence as player, enemy/spawner, static object/civilization, then terrain. Clearing or killing a dynamic entity therefore reveals the correct underlying content without reconstructing it manually.

An alternative of writing all enemies directly into `world.characters` was rejected because moving and destroying many actors would repeat the current clear/restore coupling and make exclusive occupancy harder to validate.

### Spawners use deterministic region and neighbor selection

The Underground distribution pass runs after civilization so it can exclude every previously claimed cell. It partitions the 512x512 realm into a stable 4x4 set of coarse regions and selects at most one seeded valid cell per region, producing no more than 16 normal spawners. The development/test option performs a separate seeded search within Euclidean radius 5 of the player start and adds one bonus spawner without consuming a normal region slot.

At time `1`, then at `1 + 30n`, each living spawner shuffles its eight neighboring offsets with a deterministic per-spawner/per-time seed and chooses the first valid destination. If all eight are invalid, the attempt is discarded. There is no catch-up queue and no population cap beyond valid occupancy and actor death.

### Enemy age gates actions and shared path fields guide movement

Every entity stores `bornAtTime`; age is derived rather than incremented. An enemy acts only when `age >= 2` and `age % 2 === 0`. When at least one eligible enemy is within 64 cells, the active player realm builds at most one reverse cardinal distance field from the living player's cell for that tick. The field allocates only its local 129x129 window and uses numeric cell indexes backed by a per-realm static-occupancy set, avoiding full-world allocation, per-cell object allocation, and repeated linear object scans across the 512x512 world. Eligible enemies inside the field select a free cardinal neighbor with lower distance using a fixed tie-break order. Farther enemies use a deterministic constant-time cardinal step that strictly reduces Manhattan distance until they enter the field, where obstacle-aware routing takes over. Dynamic occupants are excluded at the final step so enemies cannot overlap; an enemy blocked by actors waits. Enemies in other realms still process age and lifecycle but have no target and remain stationary.

A shared bounded reverse field was chosen over one full shortest-path search per enemy because indefinite spawning makes per-enemy 512x512 searches costly. A global unbounded field was also rejected after client profiling showed that scanning the entire world every two ticks caused visible input stalls. The far-distance greedy step is only the coarse approach phase; nearby cave and civilization barriers remain handled by the obstacle-aware field.

### Combat resolves before the resulting tick broadcast

Player input resolves destination occupancy before ordinary terrain movement. A live enemy or spawner consumes the action as a base 20-damage attack, leaves both cells unchanged, logs the result, applies death/removal if needed, then advances time once with cause `combat`. The resulting tick can make other entities act. A lethal attack does not also move the player; entering the newly free cell requires a later input.

On an eligible enemy action, cardinal adjacency resolves as a 5-damage attack through `playerLifecycle.applyHealthDelta(-5)` rather than movement. This retains clamping, immutable health publication, and one-time death behavior. Suggested initial messages are `Player hit Enemy for -20 Health`, `Player hit Enemy Spawner for -20 Health`, `Enemy hit Player for -5 Health`, `Enemy died`, and `Enemy Spawner died`; all go through Log System rather than direct UI writes.

### Health bars use a dedicated Babylon Lite overlay layer

Create a small generated solid-color atlas and a dedicated sprite layer above world glyphs. Each visible damaged enemy/spawner uses outline, dark track, red current-fill, and lighter-red damage-delta sprites positioned from the same cell-to-screen transform as its glyph. Width follows one rendered cell, height is one quarter cell, and a small proportional gap matches the supplied mockup. The current fill width is `currentHealth / maximumHealth`; the delta begins at current health and spans the latest applied damage for 300 ms before collapsing into the dark track. The overlay never enters world occupancy or minimap composition.

Damage records presentation timestamps using real elapsed presentation time, not world time. Alpha ramps from 0 to 1 over 100 ms, holds until 1,000 ms after the latest damage, then ramps to 0 over 100 ms. A new damage timestamp immediately updates current fill, resets the lighter delta to that latest loss for 300 ms, and restarts the hold. A bounded RAF continuation runs only while at least one visible bar is animating or holding, preserving the existing request-driven renderer when no bar is active.

An HTML/React overlay was rejected because it would duplicate camera transforms and move gameplay presentation across the established layer boundary.

### Palette and initial health remain centralized

Change the existing `E` and `S` palette entries to red rather than hardcoding sprite colors. Set the authoritative initial player health constant to `100` and update the initial Character model to 100%, preserving the current maximum of 100 and existing bridge subscription.

## Risks / Trade-offs

- **[Risk] Indefinite spawning can increase simulation cost over long sessions.** -> Keep per-tick work age-gated, use one shared distance field, avoid rendering offscreen entities, and add stress coverage for multiple spawn intervals without imposing an unrequested cap.
- **[Risk] Tick order can make outcomes depend on registration order.** -> Specify stable insertion order, snapshot the registry per dispatch, use stable IDs, and test newborn/removal boundaries.
- **[Risk] The stamina change can accidentally regenerate stamina on combat ticks.** -> Include a tick `cause` and verify stamina reacts only to successful movement after both changes are present.
- **[Risk] Existing `world.characters` restoration can conflict with the new occupancy index.** -> Centralize visible-cell composition and migrate player/entity writes together rather than maintaining two competing actor authorities.
- **[Risk] Health-bar RAF work can defeat movement-render optimization.** -> Continue frames only while a visible bar is active and release/hide overlay sprites immediately afterward.
- **[Risk] A development bonus spawner could leak into production.** -> Make it an explicit generation option defaulting false and enable it only from local development or focused tests.
- **[Risk] Concurrent active changes overlap `index.js`, movement, world generation, and HUD expectations.** -> Re-read current files before implementation, preserve unrelated edits, and reconcile tests against the current checkout rather than the proposal snapshot.

## Migration Plan

1. Add pure tick registry, occupancy, enemy, and spawner modules with focused deterministic tests.
2. Extend world generation and palette data, then integrate both realm records without changing React.
3. Route player movement and enemy actions through shared occupancy/combat helpers and the player lifecycle.
4. Add the Babylon Lite health-bar overlay layer and bounded presentation updates.
5. Reconcile the active stamina contract through tick causes, update focused integration tests, run the full Node suite and production build, and manually verify the requested mockup behavior in the live game.

No persisted state migration is required. Rollback is limited to the scoped client, palette, tests, and OpenSpec deltas because enemy/spawner state is session-local.
