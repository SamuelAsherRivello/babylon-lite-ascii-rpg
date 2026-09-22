# Design

## Context

The game uses a split architecture: Babylon Lite owns world generation, movement, fog discovery, realm transitions, and minimap rendering; React owns the HUD; `game-bridge.js` is the narrow state boundary between them. Fog-of-war already stores per-cell visibility per realm for the lifetime of the generated world, and realm transfers swap the active `world.fog` record. The upper-right HUD currently reads only the active realm snapshot and renders world/floor text plus time.

## Goals / Non-Goals

**Goals:**

- Compute discovery from authoritative fog and terrain state in the game layer.
- Publish a small immutable discovery snapshot through the existing bridge pattern.
- Render the requested `World: 1 Realm ±1 (N%)` line in React.
- Provide the requested hover explanation from the same live percentage and realm state.
- Keep discovery percentage realm-local and session-scoped.
- Keep calculation cheap enough to update when discovery changes and when realms switch.

**Non-Goals:**

- Persist discovered coverage across reloads.
- Add new worlds beyond world `1`.
- Change fog reveal radius, line-of-sight behavior, minimap rendering, or realm generation.
- Add dependencies or a second state-management mechanism.

## Decisions

### Calculate total walkable tiles once per fog record

The fog system should expose a helper that calculates discovery percentage from a fog record and world terrain. The denominator should be the count of walkable tiles in the active realm. The current fog record already maintains per-minimap walkable counts and visibility totals, but those totals are opacity-weighted and coarse-area oriented. For the HUD percentage, the numerator must count walkable cells with visibility greater than `0`, not sum visibility strength.

Alternative considered: Reuse minimap opacity totals. That would make partially visible cells count fractionally, which conflicts with the requested "have you unfogged" semantics.

### Track discovered walkable count incrementally

Extend the fog record with `walkableCellCount` and `discoveredWalkableCount`. Initialize `walkableCellCount` while iterating terrain in `createFogOfWar`. Increment `discoveredWalkableCount` only when a walkable cell changes from `0` visibility to positive visibility. Do not decrement because session fog visibility never decreases.

Alternative considered: Scan the full `visibility` array every time the HUD needs a value. That is simpler but unnecessary for a 512 x 512 world and would put UI reads on a path that should remain constant-time.

### Publish discovery through the existing bridge snapshot pattern

Add `getRealmDiscoverySnapshot`, `subscribeToRealmDiscovery`, and `sendRealmDiscoverySnapshot` beside the existing realm/time/minimap snapshot APIs. The game layer should notify the bridge from `main.jsx` by subscribing to a controller-level discovery API, matching the existing realm, quest, and resource flows.

Alternative considered: Let React query the game controller directly. That would blur the current bridge boundary and make React depend on Babylon runtime internals.

### Notify after every discovery-affecting path

The game layer should notify discovery listeners after starting-area discovery, normal player discovery, route discovery before stair transfer, and realm activation. Notification can be coalesced by comparing the previous snapshot before publishing. The realm activation notification matters even when no new tiles are revealed, because the displayed percentage must switch to the destination realm's value.

Alternative considered: Notify only on player movement. That would miss startup, settings-driven realm preference restoration, and realm transfer updates.

### Keep HUD formatting in React

React should continue to format the visible status string. It already knows the active realm and time snapshots, so it can map Overground to `1`, Underground to `-1`, and read `percent` from the discovery snapshot. The bridge snapshot should provide numeric data, not a preformatted string.

Alternative considered: Send a fully formatted status string from the game layer. That would make the game layer own HUD copy and make future UI layout changes harder.

## Risks / Trade-offs

- [Risk] Discovery can update very frequently while holding movement input. → Mitigation: publish only when the active realm or rounded percent changes.
- [Risk] Starting reveal may make the initial display nonzero instead of the literal default `0%`. → Mitigation: specs define the percentage from actual fog state; tests should assert `0%` only for an explicitly fogged test realm, not necessarily the generated startup scene after starting reveal.
- [Risk] Existing source tests assert the old `World/Floor` string. → Mitigation: update those tests to assert the new `World/Realm/Discovered` contract.
- [Risk] Counting positive visibility differs from minimap opacity. → Mitigation: keep separate fields and tests so minimap opacity behavior remains unchanged.

## Migration Plan

No data migration is required. Existing sessions reload into a newly generated world and recompute session-scoped fog records as before. Rollback is limited to removing the new bridge snapshot and restoring the previous HUD text.
