# Proposal

## Why

The generated world has static objects and civilization features but no autonomous hostile population, time-driven entity lifecycle, or collision combat. Adding Underground enemy spawners and enemies establishes the first reusable tick-driven character simulation while keeping gameplay authoritative in Babylon Lite.

## What Changes

- Add an Underground-only Enemy Spawner System that deterministically distributes red `S` spawners across up to sixteen coarse world regions after existing object and civilization placement.
- Add one development/test-only spawner within Euclidean distance `5` of the Underground player start for immediate playtesting; production builds omit this bonus spawner.
- Give each spawner `100` health, no movement or attack behavior, an initial spawn at world time `1`, and one attempted enemy spawn every `30` time units while alive.
- Spawn one red `E` enemy into a free walkable neighboring cell, never replacing terrain, objects, civilization features, the player, another spawner, or another enemy; a fully blocked spawn attempt is skipped without backlog.
- Add an Enemy System whose entities record `bornAtTime`, start at `100` health, become eligible to act at age `2`, and thereafter take one simulation turn every two time units.
- Rework the Time System into a deterministic tick broadcaster for registered tickable entities. Every tickable entity simulates on every world-time tick regardless of active realm or visibility; rendering remains limited to the active realm and visible region.
- Make enemies use deterministic cardinal pathfinding toward a same-realm living player, remain stationary without a same-realm target, and attack for `5` damage by attempting to enter the player's occupied cell without sharing it.
- Make player movement into an enemy or spawner resolve a base `20`-damage attack without moving the player into the occupied cell. Zero-health enemies are removed; zero-health spawners are permanently destroyed and can never spawn again.
- Start the player at `100` health and preserve the existing player-death lifecycle when enemy damage reaches zero.
- Log player, enemy, and spawner damage/death events through the existing Log System.
- Add renderer-owned, non-diegetic health bars for visible damaged enemies and spawners only. Their three interior colors show current health, the latest 300 ms damage delta, and unfilled health. A bar is normally hidden, fades in over `0.1` seconds on damage, remains visible for `1` second after the latest damage, and fades out over `0.1` seconds; the player keeps only the existing HUD health display.
- Add focused deterministic system tests, integration coverage, full Node validation, production build verification, and manual browser proof for spawning, simulation, combat, death, logging, realm-independent ticking, and health-bar presentation.

## Capabilities

### New Capabilities

- `enemy-spawner-system`: Underground spawner distribution, health, spawn cadence, neighboring-cell selection, permanent destruction, and development/test placement.
- `enemy-system`: Enemy identity, birth/age lifecycle, deterministic movement, combat, health, death, and realm-independent simulation.
- `in-world-health-bars`: Damage-triggered health-bar layout, timing, refresh, visibility, and player exclusion.

### Modified Capabilities

- `time-system`: Broadcast every world-time advance to registered tickable entities in deterministic order.
- `world-generation-passes`: Add Underground enemy-spawner distribution after object and civilization placement.
- `procedural-level-generation`: Retain spawners and enemies in explicit dynamic character state without changing terrain or walkability.
- `player-grid-movement`: Resolve attempted movement into enemies and spawners as attacks rather than shared-cell movement.
- `player-lifecycle`: Start the player at 100 health and accept enemy attack damage through the authoritative lifecycle.
- `character-info`: Display the new 100% initial player health in the existing HUD.
- `ascii-palette`: Give `E` and `S` explicit red palette identities for enemies and spawners.
- `game-layer-architecture`: Keep tick registration, enemy/spawner simulation, combat, health bars, and dynamic rendering authoritative in Babylon Lite.

## Impact

- Primary client impact is under `ascii-rpg/src/client/game-layer-babylon-lite/`, especially `index.js`, `systems/time-system.js`, `systems/world-system.js`, new enemy/spawner systems, palette data, world composition, and renderer layers.
- Existing object and civilization systems remain separate authorities; enemy spawners are damageable tickable entities rather than Object Spawner catalog objects.
- React receives only the existing immutable player health/death/log snapshots and does not receive enemy coordinates, spawner coordinates, tick registries, or health-bar state.
- No new client dependency is expected. Health-bar animation uses the existing game render loop and elapsed presentation time.
- The change must preserve deterministic seeded generation, both realms, camera modes, fog, lighting, minimap behavior, narrow bridge ownership, and the existing no-shared-cell rule.
