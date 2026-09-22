# Proposal

## Why

New sessions currently reveal only the normal movement-sized area around the
player. The opening screen can therefore be mostly fogged even though the
player is already looking at a full-screen map, making the initial Overground
and Underground experiences feel unnecessarily opaque. This change adds a
one-time, realm-specific starting reveal while retaining the existing fog
discovery behavior as the player moves.

## What Changes

- Add a starting fog-clear operation that runs after each realm's player start
  is established, in addition to the existing movement-triggered discovery.
- Derive the starting clear footprint from the logical viewport that the game
  would have at displayed zoom `5`, using the same viewport/grid sizing rules
  as the game renderer.
- Use independent horizontal and vertical coverage values, centered on the
  realm's player start and clamped to the generated world bounds:
  - Overground: `95%` of the zoom-5 viewport width and `95%` of its height.
  - Underground: `60%` of the zoom-5 viewport width and `60%` of its height.
- Treat the percentages as the dimensions of the clear footprint, not as
  pixel values or a change to the ordinary movement fog radius. Preserve the
  current persistent visibility, falloff, walkability, and clear-path rules
  for cells included in the starting reveal.
- Keep each realm's starting reveal isolated in its own fog record and avoid
  changing fog behavior in the inactive realm until that realm is entered.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `fog-of-war-minimap`: Change new-realm initialization so the player-start
  area receives a realm-specific zoom-5-sized initial reveal before normal
  movement discovery continues.

## Impact

- Affected client areas are the Babylon Lite fog-of-war system, world/realm
  initialization, and the viewport/grid sizing helpers used to resolve the
  zoom-5 logical screen dimensions.
- Focused fog, world initialization, realm isolation, and rendering tests will
  need coverage for the Overground `95%` footprint, Underground `60%`
  footprint, separate X/Y extents, world-bound clamping, and continued
  movement discovery.
- No new dependencies, persistence keys, UI controls, or public bridge APIs
  are expected.
- The existing term `Overground` is used for the user's “Overworld” wording,
  because that is the realm name in the current application and specifications.

