# Design

## Context

See [proposal.md](proposal.md) for motivation and the delta specification for
the observable lighting contract. Terrain cells currently expose `walkable`,
and every CPU and cached light-path calculation uses that one value as its
occlusion predicate. Water generation already identifies cells canonically by
kind and depth, so it can be marked transparent without changing collision or
the water presentation layer. Door and other gameplay mutations can change
terrain walkability, so their optical state must be updated and lighting caches
must be invalidated along the same mutation path.

## Goals / Non-Goals

**Goals:**

- Give terrain a stable, explicit optical-occlusion value independent of
  walkability.
- Preserve existing shadows for walls, mountains, and opaque closed objects.
- Apply the same blocker decision to direct lighting, visible-field caching,
  and GPU penumbra calculations.
- Keep terrain without the new value compatible during rollout.

**Non-Goals:**

- Changing water movement, collision, fog, generation placement, or animated
  water presentation.
- Adding refraction, colored transmission, partial opacity, or a new player
  setting.
- Replacing palette/grid lighting with Babylon light objects.

## Decisions

### Use `blocksLight` as a boolean terrain-cell property

Terrain construction will assign `blocksLight: false` to floor and water, and
`true` to walls, mountains, and other opaque terrain. The lighting predicate
will prefer this explicit property. If it is absent, it will fall back to the
current `walkable !== true` rule so old fixtures and terrain producers remain
opaque until migrated.

This expresses the two independent gameplay facts directly and avoids
hard-coding water identity in lighting. A water-only `kind` or `depth` check
was rejected because it would duplicate terrain taxonomy in the lighting
system and fail to support future impassable transparent cells.

### Centralize light blocking in one predicate

All grid-ray callers will use the same terrain-cell blocker predicate: direct
path checks, blocker counts, shadow distance, CPU visible fields, cached
fields, and GPU direct/penumbra inputs. This prevents a water ray from being
clear in one renderer path but shadowed in another.

Maintaining separate per-renderer checks was rejected because shadow behavior
would inevitably drift between sprite and GPU presentation.

### Treat dynamic opacity as a mutation input

Dynamic terrain/object transitions that currently alter movement occupancy
(particularly opening/closing opaque doors) will set their matching
`blocksLight` state and invalidate the scene-lighting cache. The change will
audit terrain writers rather than assume every non-walkable object is opaque;
for example, a torch remains independently non-walkable if gameplay requires
it but does not gain unintended optical opacity.

Keeping `blocksLight` derived only at initial world generation was rejected:
it would leave stale shadows after gameplay state changes.

## Risks / Trade-offs

- [A terrain writer omits `blocksLight`] -> The legacy fallback preserves prior
  opaque behavior; focused construction tests will make desired transparent
  cases explicit.
- [A dynamic mutation updates terrain but leaves cached light values stale] ->
  Route it through the existing lighting invalidation path and test a
  stationary source across the transition.
- [Existing tests model walls with only `walkable: false`] -> Keep the
  fallback so those fixtures continue representing legacy opaque blockers;
  add explicit water-transparent fixtures alongside them.

## Migration Plan

1. Add explicit optical state to terrain generation and canonical water cells.
2. Change the shared lighting predicate to prefer it with the legacy fallback.
3. Update dynamic opaque terrain/object mutation paths and cache invalidation.
4. Add focused Node coverage for water transmission, opaque shadows, diagonal
   rays, and dynamic changes; then run the repository test/build checks and
   manually verify a seeded world with water between a source and target.

Rollback is limited to reverting the scoped change; fallback behavior ensures
partially migrated terrain remains visually compatible while the change is in
development.
