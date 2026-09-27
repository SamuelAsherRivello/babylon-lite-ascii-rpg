# Proposal

## Why

The lighting system currently infers light occlusion from terrain walkability. That makes non-walkable water cast opaque grid shadows, despite water needing to remain traversally blocked while allowing light to reach cells beyond it.

## What Changes

- Add an explicit terrain optical-occlusion property distinct from movement walkability.
- Make generated water non-walkable but transparent to direct torch and player light.
- Make straight shadow, cached lighting-field, and GPU player-penumbra calculations use optical occlusion rather than walkability.
- Preserve existing opaque behavior for walls, mountains, and closed opaque terrain or objects; update dynamic state changes to keep their occlusion state accurate.
- Preserve legacy opaque behavior for terrain without the new property during the migration.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `palette-grid-lighting`: Define straight grid-shadow behavior from explicit optical occlusion so impassable transparent terrain does not block light.

## Impact

- Affects world terrain-cell construction and mutations, lighting path traversal, cached lighting fields, GPU shadow/penumbra inputs, and focused lighting/world tests.
- Does not add dependencies or alter water collision, movement, generated position, fog identity, or rendering-layer precedence.
