# Proposal

## Why

The last 24 hours of repository history repeatedly changed the procedural-generation catalog, profile, persistence store, game entry point, and UI entry point together. Their overlapping responsibilities make parallel feature work unnecessarily likely to conflict even when contributors work on distinct generation domains.

This change establishes explicit `generation-layers` boundaries and reduces the size and responsibility overlap of the highest-traffic game, UI, and test modules without changing player-visible behavior, saved-setting semantics, generation order, or public bridge contracts.

## What Changes

- Split procedural-generation implementation into owner-scoped `generation-layers` modules, including `grid-generation-layer`, terrain, water, walkability, player-start, object, civilization, and dynamic-entity generation layers.
- Make one registry the canonical source of generation feature metadata, density policy, dependency order, and semantic-card grouping; remove duplicated metadata from the settings store and profile resolver.
- Retain stable facade exports for callers while reducing `game-layer-babylon-lite/index.js` to game-session composition, input coordination, preview coordination, and renderer-controller wiring.
- Extract independently owned React windows, HUD components, and settings hooks from `App.jsx` while retaining the existing UI and narrow game bridge behavior.
- Split pure world-generation helpers from mutable world-state operations, and move broad source-contract tests into mirrored, owner-specific test modules.
- Preserve persisted settings format and compatibility normalization, deterministic seeded generation, current pass ordering, and all existing public behavior.

## Capabilities

### New Capabilities

None. This is an internal refactor with no new user-visible behavior.

### Modified Capabilities

None. Existing behavior contracts for game-layer ownership, procedural settings, and ordered world-generation passes remain unchanged.

## Impact

- Affected source: `ascii-rpg/src/client/game-layer-babylon-lite/`, `ascii-rpg/src/client/ui-layer-react/`, and `ascii-rpg/test/`.
- Affected high-traffic modules: generation settings/profile/store, game entry point, React entry point, world system, and broad contract tests.
- No new runtime dependencies, data migration, bridge API change, or player-visible behavior change.
- The change uses `skip_specs: true` because it deliberately preserves current specification requirements.
