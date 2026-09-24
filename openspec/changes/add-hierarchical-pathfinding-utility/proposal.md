# Proposal

## Why

Grid navigation is currently implemented in several systems, while distant enemies fall back to Manhattan-greedy movement that cannot route around barriers. A shared adapter around `@esengine/pathfinding` will consolidate route semantics, provide hierarchical long-distance routing, and keep the present deterministic cardinal gameplay rules intact.

## What Changes

- Add the `@esengine/pathfinding` dependency and isolate its verified non-diagonal A* calls behind a Babylon Lite `utilities/a-star-utility.js` module rather than importing the dependency from gameplay systems.
- Provide a strictly cardinal-only API for deterministic same-realm routes, reachability, distance fields, nearest-target lookup, and hierarchical coarse-sector routing using the game's `{ x, y }` cells and its walkability/occupancy predicates. The utility owns its cardinal sector graph because the dependency's HPA* output is not cardinal-safe.
- Provide an opt-in cross-realm route mode that joins otherwise separate realm routes only through validated paired stairs. Same-realm routing remains the default, and this change does not make enemies pursue a player in another realm.
- Replace duplicate in-project route searches where equivalent behavior is needed: enemy pursuit, NPC patrol route creation and spawn validation, quest/minimap nearest-target lookup, nearest-stairs travel, and bounded building-key reachability.
- Preserve existing destination selection, cardinal tie ordering, occupancy, combat, tick cadence, fog, stair-transfer, and marker behavior. The utility is a routing authority, not a movement, transfer, combat, or rendering authority.
- Record the requested short sprint-right FPS baseline before implementation and repeat the identical scenario after implementation, reporting the comparison as diagnostic evidence rather than a performance guarantee.

## Capabilities

### New Capabilities

- `navigation-utility`: Defines the game-layer-only, deterministic cardinal route API, its hierarchical distant-route behavior, and its optional stair-mediated cross-realm route contract.

### Modified Capabilities

- `enemy-system`: Keeps same-realm pursuit and cross-realm idling while replacing the distant greedy fallback with a deterministic route supplied by the shared utility.

## Impact

- Affected code: root package manifest and lockfile; a new `ascii-rpg/src/client/game-layer-babylon-lite/utilities/a-star-utility.js`; `enemy-system`, `npc-system`, `npc-spawner-system`, `minimap-renderer`, `building-system`, and the game-layer's nearest-stairs helper.
- Affected tests: focused utility tests plus updates to each existing route consumer's Node tests; no Playwright tests are introduced.
- Dependency: `@esengine/pathfinding`; React and the narrow bridge remain outside the route API.
- Performance evidence: the pre-change in-app-browser HUD showed 33 FPS following a hasty one-second sprint-right sequence at `http://127.0.0.1:5178/babylon-lite-ascii-rpg/?skipTutorial=true&performance=sprint`. This is an automation-background baseline, not a foreground benchmark.
