# Proposal

## Why

The last 24 hours of repository history repeatedly changed the procedural-generation catalog, profile, persistence store, game entry point, and UI entry point together. Their overlapping responsibilities make parallel feature work unnecessarily likely to conflict even when contributors work on distinct generation domains.

This change establishes explicit `generation-layers`, game-session, and UI-owner boundaries for the highest-traffic areas that were actively being refactored, without changing player-visible behavior, saved-setting semantics, generation order, or public bridge contracts. The scope is intentionally bounded to the completed extraction work and its contract coverage; broader entry-point reduction and test-file repartitioning remain outside this change.

## What Changes

- Split procedural-generation implementation into owner-scoped `generation-layers` modules, including `grid-generation-layer`, terrain, water, walkability, player-start, object, civilization, and dynamic-entity generation layers.
- Make one registry the canonical source of generation feature metadata, density policy, dependency order, and semantic-card grouping; remove duplicated metadata from the settings store and profile resolver.
- Retain stable facade exports for callers while introducing game-session composition, input coordination, preview coordination, and renderer-controller boundaries.
- Extract the completed owner-scoped React windows, HUD components, and stored-setting helpers from `App.jsx` while retaining the existing UI and narrow game bridge behavior.
- Keep source-contract coverage aligned with the extracted UI owners through a module-aware contract harness; broader test-file repartitioning is not part of this bounded change.
- Preserve persisted settings format and compatibility normalization, deterministic seeded generation, current pass ordering, and all existing public behavior.

## Capabilities

### New Capabilities

None. This is an internal refactor with no new user-visible behavior.

### Modified Capabilities

None. Existing behavior contracts for game-layer ownership, procedural settings, and ordered world-generation passes remain unchanged.

## Impact

- Affected source: `ascii-rpg/src/client/game-layer-babylon-lite/`, `ascii-rpg/src/client/ui-layer-react/`, and `ascii-rpg/test/`.
- Affected high-traffic modules: generation settings/profile/store, world system, game-session controllers, React UI owners, and contract tests.
- No new runtime dependencies, data migration, bridge API change, or player-visible behavior change.
- The change uses `skip_specs: true` because it deliberately preserves current specification requirements.
