# Design

## Context

See [proposal.md](proposal.md). The game layer currently concentrates generation helpers, world mutation, startup orchestration, rendering coordination, and input in large modules. Generation feature metadata is also repeated in the editable catalog, registry, profile resolver, and React settings store. `App.jsx` similarly contains windows, HUD presentation, persistence helpers, and bridge coordination. Tests already mirror many source paths, but `main_tests.mjs` remains a broad source-contract collection.

The implementation must preserve the established React/bridge/Babylon Lite ownership boundary, the current ordered deterministic generation pipeline, development-file and deployed-localStorage settings behavior, and the explicit Node test command. It must not add a dependency or create a second game-state owner. This design records the bounded extraction that was completed; full decomposition of the remaining large entry modules and broad manual QA are deliberately deferred to separate work.

## Goals / Non-Goals

**Goals:**

- Give each procedural pass a discoverable, independently editable `generation-layers` module.
- Make feature metadata and density mapping single-source while retaining settings compatibility.
- Isolate lifecycle, rendering, UI-window, and settings-helper ownership behind stable facades.
- Ensure source contracts observe the extracted modules without requiring a broad test-file move.

**Non-Goals:**

- Changing procedural pass order, density values, seeded output, save keys, or game presentation.
- Redesigning the Procedural window, bridge commands, or world data model.
- Introducing classes where a pure function or factory gives a clearer dependency boundary.
- Combining this refactor with the in-progress feature changes already touching generation files.

## Decisions

### 1. Use `generation-layers` as the physical pass boundary

Create `game-layer-babylon-lite/generation-layers/` with one module per ownership boundary:

```text
generation-layers/
  grid-generation-layer.js
  terrain-generation-layer.js
  water-generation-layer.js
  walkability-generation-layer.js
  player-start-generation-layer.js
  object-generation-layer.js
  civilization-generation-layer.js
  dynamic-entity-generation-layer.js
  generation-layer-registry.js
```

Each layer receives an explicit immutable generation context and returns or claims only its own result. The registry owns feature order, realms, dependencies, semantic-card grouping, and density policy. This is preferred to one generic class hierarchy: pass functions keep the existing deterministic data flow transparent and prevent a shared mutable base class from becoming a new conflict hub.

### 2. Preserve a narrow compatibility facade while extracting orchestration

Keep existing public exports and `startGameLayer` behavior stable. Move session state and coordination behind focused factories under `game-session/`: game-service setup, input control, generation preview control, and renderer controllers. The entry module becomes a composition facade rather than a place for pass algorithms or independent subsystem implementation.

This is preferred to a single replacement `GameSession` class because the current systems already expose composable factory APIs and need explicit disposal ownership, not inherited state.

### 3. Separate pure world generation from mutable world operations

Move grid, cave/terrain, water, walkability, and static distribution helpers out of `world-system.js` into the corresponding generation layers. Retain world-cell reads, character-marker mutation, realm assembly, and the existing public world-system API in a thin facade. Each extracted module must take its dependencies as parameters instead of importing mutable session state.

### 4. Use feature-owned settings metadata, not parallel copies

The generation-layer registry is the source for configurable status, defaults, realm scope, descriptions, and density conversion. The settings store remains responsible only for normalization, persistence, subscriptions, and legacy-key migration. The profile resolver becomes a compatibility adapter that derives runtime values from the registry; it must not define another catalog.

The existing serialized settings shape and storage key remain unchanged. This avoids a migration and allows active work to retain its current persisted values.

### 5. Extract the completed UI owners and preserve contract coverage

Extract the completed `App.jsx` windows, character/quest/log presentation, and browser-persistence helpers into independently owned modules while leaving `AppContent` as bridge and top-level state composition. Make the existing source-contract harness read the owner modules so moved contracts remain executable. Do not expand this change into a complete `main_tests.mjs` file split or add Playwright work.

## Risks / Trade-offs

- [A pass extraction subtly changes seeded output or pass order] -> Preserve the existing facade, inject the same seed/context, and add before/after deterministic regression fixtures for both realms.
- [The registry and persisted data drift during the transition] -> Maintain one registry and test legacy normalization plus a complete default catalog.
- [Large moves conflict with active generation changes] -> Land the refactor in small owner-scoped commits only after reconciling the active changes; do not overwrite their working-tree edits.
- [New module paths are omitted from the explicit test command] -> Update the test command only after all mirrored test paths exist and run the complete Node suite.
- [Facade extraction changes disposal or render scheduling] -> Keep lifecycle ownership in one controller, expose explicit `dispose` paths, and verify existing rendering and transition tests.

## Migration Plan

1. Capture baseline deterministic generation, settings normalization, bridge, render, and UI contract results.
2. Introduce the registry and generation-layer modules behind unchanged exports; migrate one pass family at a time in current order.
3. Reduce the game entry point to composition after its extracted controllers pass focused tests.
4. Extract the scoped UI components and update contract-source loading without changing DOM text, persisted settings, or bridge messages.
5. Run the focused Node contract suite and production build; retain broader manual verification as a separate follow-up when needed.
6. Roll back by restoring the previous facade internals in a follow-up commit; no persisted-data cleanup is required because the wire format remains unchanged.

## Open Questions

None.
