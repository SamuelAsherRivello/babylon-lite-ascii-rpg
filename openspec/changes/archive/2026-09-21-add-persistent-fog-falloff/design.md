# Design

## Context

The current Babylon Lite fog module owns a `Uint8Array` boolean discovery
field, realm-specific fog radii, clear-path checks, and coarse minimap
coverage. The shared world-view composition calls that fog state for both the
game view and mini-map, while the game layer submits Babylon sprites and the
mini-map draws rasterized glyph canvases. See proposal.md for the motivation
and observable behavior.

## Goals / Non-Goals

**Goals:**

- Make the fog module the authoritative owner of persistent `0..100`
  visibility values.
- Preserve the existing world/session reset, realm radius, line-of-sight, and
  layer-boundary behavior.
- Carry one per-cell visibility value through the shared world-view contract
  so game and mini-map presentation cannot drift.
- Make visibility increases invalidate the affected game and mini-map
  presentations, including their alpha values.

**Non-Goals:**

- Changing generated terrain, player-light radius values, collision, movement,
  camera behavior, or realm transitions.
- Adding a React setting, bridge message, persistence across reloads, or a new
  rendering dependency.
- Replacing the existing minimap zoom, marker ordering, or lighting systems.

## Decisions

### Store numeric visibility in the fog system

Replace the boolean interpretation of the per-cell field with a numeric
visibility field capable of storing the inclusive range `0..100`. Keep a
boolean-style eligibility helper only as a compatibility convenience for
callers that need to know whether a cell is renderable; its result SHALL be
derived from visibility being greater than `0` rather than from a separate
source of truth.

Discovery remains gameplay-owned. Each clear walkable target receives a
distance-band candidate value, and the fog system stores the maximum of that
candidate and the existing value. Minimap aggregate bookkeeping must account
for increases more than once, so an update contributes only the delta between
the new and old visibility values.

### Use explicit normalized distance bands

Use the existing Euclidean grid distance and active realm radius. The band
boundaries are `0.70`, `0.80`, `0.90`, and `1.00` of the radius. Values at the
outer boundary remain `25`; values beyond the radius or behind a blocked path
produce no increase. Explicit thresholds are preferred over a continuous
floating-point opacity curve because the requested presentation has four
stable steps and is easier to test at boundaries.

### Extend shared world-view cells with visibility

The composition should carry the numeric visibility for every source cell and
continue to carry a positive-visibility eligibility value for existing slot
reconciliation. A zero-visibility cell has no glyph and is hidden. Positive
visibility cells retain their shared glyph identity and expose their opacity
to each destination renderer.

### Apply fog opacity at the final presentation boundary

The game sprite submission multiplies the fog alpha by the existing lighting
alpha after lighting color resolution. The mini-map glyph canvas or draw
submission applies the same fog factor after its existing unlit/lighting
color choice. Fog opacity becomes part of presentation-cache and sprite-state
identity so a cell whose stored visibility increases is submitted again even
when its glyph and lighting are unchanged. Marker ordering and marker colors
remain unchanged; the fog gate continues to prevent hidden world content from
leaking into marker eligibility.

### Aggregate minimap opacity from persistent values

The minimap continues to use its existing 10 by 10 world-cell areas and
walkable-cell eligibility, but its area opacity becomes the average persistent
visibility of eligible walkable cells divided by `100`. Areas without
walkable cells remain at zero. The world glyph/color selection remains based
on the same eligible cells and is not replaced by a second fog calculation.

### Preserve layer boundaries

Fog discovery and numeric visibility remain in the Babylon Lite game layer.
React and the bridge receive no fog-state API, and rendering does not mutate
fog. The game view and mini-map continue to consume the shared world-view
composition rather than independently calculating falloff.

## Risks / Trade-offs

- [Risk] Existing callers and tests may assume a `0/1` discovery field. ->
  Mitigation: update the focused fog, world-view, minimap, and rendering
  contracts together, and retain a derived positive-visibility predicate for
  callers that only need eligibility.
- [Risk] Visibility can increase repeatedly as the player revisits an area,
  making cached minimap totals stale. -> Mitigation: update aggregate totals
  by the exact per-cell delta or derive the aggregate from the authoritative
  field during the minimap calculation, then test repeated upgrades.
- [Risk] Fog alpha may be lost when lighting or glyph-background presentation
  reuses an existing cache entry. -> Mitigation: include fog visibility in
  sprite/cache state and verify `25/50/75/100` transitions in focused tests.
- [Risk] Partial world content could expose additive light effects too
  strongly. -> Mitigation: apply the same positive-visibility gate and fog
  factor to world-owned light presentation while leaving markers as the
  existing explicit overlay layer.
