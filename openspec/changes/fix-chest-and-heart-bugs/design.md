# Design

## Context

See `proposal.md` for the user-visible problem. The current game has a Babylon Lite movement layer, an object spawner with standalone and house-owned objects, a world-owned object/pickup collection, and a React Log UI fed through the game bridge. Existing isolated object-spawner tests do not prove that a real movement input reaches chest interaction or that the resulting world mutations become visible and collectible in the active session.

## Goals / Non-Goals

**Goals:**

- Establish one authoritative chest-opening lifecycle for standalone and house-owned chests.
- Make first-contact movement, opening log, Heart registration/rendering, Heart collection, and collection log observable as one session flow.
- Keep chest rewards deterministic under an explicit random seed while preserving neighboring-cell selection and occupancy rules.
- Add an actual-game verification path that drives movement rather than calling the object system directly.

**Non-Goals:**

- No new reward types, chest UI, inventory system, or renderer replacement.
- No change to unrelated NPC, enemy, performance, or world-generation behavior.
- No new runtime dependency unless the existing browser verification tooling cannot exercise the current game surface; any such need remains an unresolved decision.

## Decisions

### Use the active game session as the acceptance boundary

The implementation will trace and test the path from mapped keyboard/pointer movement through contact resolution, object mutation, render scheduling, bridge log publication, and pickup collision. Direct calls to `interactAtCell()` remain useful unit coverage but cannot be the only acceptance proof.

**Alternative considered:** Expanding only object-spawner unit tests. Rejected because those tests can pass while the actual movement path never invokes the interaction or the renderer never presents the reward.

### Keep the Object Spawner authoritative for chest and Heart state

Chest state, reward creation, active object registration, and pickup collision remain in the Object Spawner boundary. The game layer supplies the active realm, player position, seeded random source, log callback, and Heart effect callback. The renderer consumes the resulting authoritative world/object changes through the existing invalidation path.

**Alternative considered:** Creating a special game-layer-only chest reward path. Rejected because it would duplicate behavior and risk divergence for house-owned chests.

### Treat logs as observable lifecycle outputs

The opening log and Heart collection log will be asserted through the existing Log System/bridge-facing snapshot or visible Log UI, not merely by spying on a callback. The test will also assert that repeated contact does not duplicate the opening output.

### Make the end-to-end scenario deterministic

The actual-game check will use an explicit `randomSeed` and a controlled generation profile or deterministic chest selection mechanism already supported by the game. It will discover the chest from the rendered/authoritative game state or use a stable seeded location, then issue real movement inputs until contact. The test must verify the Heart location and walk to that location before checking collection output.

## Risks / Trade-offs

- [Risk] Procedural generation can place the player far from a chest or make a neighboring Heart cell unavailable. -> [Mitigation] Use an explicit seed and a test setup that guarantees a reachable chest and at least one valid neighboring reward cell; separately retain a no-valid-cell unit scenario.
- [Risk] Cached world-view or static occupancy state can hide a dynamically spawned Heart. -> [Mitigation] Assert both authoritative object registration and rendered visibility, and invalidate every affected cell through the active renderer path.
- [Risk] The Log panel may be collapsed or the bridge may be attached to a stale controller. -> [Mitigation] Verify the bridge snapshot and visible UI state from the same live controller, explicitly opening the Log panel when the test begins.
- [Risk] Existing unrelated dirty work can alter deterministic generation fixtures. -> [Mitigation] Preserve unrelated files and report baseline/full-suite failures separately from this change's focused and end-to-end results.
