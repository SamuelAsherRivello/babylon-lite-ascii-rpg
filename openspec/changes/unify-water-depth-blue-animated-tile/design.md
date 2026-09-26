# Design

## Context

See [proposal.md](proposal.md) for motivation. The water pass currently grows
deterministic lake shapes and assigns each selected cell a shallow, medium, or
deep depth. The world system derives glyph, palette color, and walkability from
that depth. The interactive game view already supports terrain-art keys and
shared-time animated presentation for other object types.

## Goals / Non-Goals

**Goals:**

- Preserve deterministic lake selection while making each selected water cell
  one non-walkable canonical water type.
- Render a single approved blue Tiled animation for all visible water cells
  without creating one timer or animation state per cell.
- Preserve fog, renderer cache behavior, overlays, and both-realm generation.

**Non-Goals:**

- Changing water density, lake size, realm profiles, collision rules other
  than water traversal, or world-generation pass order.
- Selecting red or green water artwork, adding a Tiled map loader, or
  autotiling water shorelines.
- Replacing art for ground, walls, props, actors, effects, or UI views.

## Decisions

### Canonical water data replaces depth bands

The water pass will retain its existing selected lake-cell output and map-shaped
water result, but assign every selected key the single `water` depth value.
The world-system terrain mapping will derive one water glyph, color, and
`walkable: false` result from it. Keeping map-shaped output limits the change
to the depth-to-terrain boundary and preserves consumers such as `waterCells`
and lake diagnostics. The alternative—treating legacy `deep` as the canonical
value—would retain a misleading depth name and continue exposing obsolete
three-depth semantics.

Walkability and player-start selection will continue to run after the water
pass; they will treat every canonical water cell as blocked. This intentionally
changes fixed-seed layouts and reference fixtures wherever water exists, while
retaining seed determinism for the new rules.

### One qualified blue animation source

Implementation begins with an asset audit of the checked-in Tiled asset set.
It will record the blue frame strip or frame coordinates, dimensions, frame
order, timing, and attribution/license evidence. Only a contiguous,
dimension-compatible blue animation qualifies; red and green candidates are
excluded. The runtime will use the existing asset/atlas pathway rather than a
Tiled map parser or a new animation dependency.

### Shared animation clock and terrain-layer submission

The renderer will calculate a single animation frame from its existing render
time and the qualified frame cadence, then apply that frame to every visible
water terrain cell for the render pass. A terrain-art key or equivalent
presentation discriminator will keep cache entries distinct from glyph-only
water. This avoids independent timers, keeps frame changes synchronized, and
lets normal visible-region reconciliation update stale slots.

Water art will be emitted at terrain level. Existing object, actor, static
feature, particle, and UI overlay paths will remain above it. Fog opacity will
continue to govern visibility; animation changes must invalidate only the
water terrain presentation needed for the new shared frame.

## Risks / Trade-offs

- [Blocking all water can split a previously traversable area] → Re-run
  connected-region validation after water and assert that player placement is
  ground-only for water-bearing seeds.
- [The named blue animation may not have compatible source geometry] → Audit
  before coding; stop the art step and report the mismatch rather than using a
  red/green tile or inventing frames.
- [Frame changes can cause excessive sprite updates] → Use one shared frame,
  cached terrain-art keys, and focused render-metrics checks.
- [Animated art may obscure overlays or behave incorrectly under fog] → Keep
  terrain-layer ordering and verify overlay and partial-visibility cases with
  a fixed seed.

## Migration Plan

1. Replace depth-band generation and its tests with canonical blocked-water
   semantics, then update dependent glyph, palette, lighting, and player-start
   expectations.
2. Qualify and integrate the blue animation through the existing sprite atlas
   path, followed by focused renderer tests.
3. Run the repository test/build and strict OpenSpec checks, then manually
   inspect a fixed-seed water-bearing world before presenting the result.

Rollback is an ordinary code revert of this isolated change before release;
no saved-data migration, asset deletion, or user setting migration is needed.
