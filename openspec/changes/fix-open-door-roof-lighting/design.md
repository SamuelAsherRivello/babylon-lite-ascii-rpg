# Design

## Context

See proposal.md for motivation. Home generation keeps interior terrain
walkable, closes the Door by making its terrain non-walkable, and renders the
same interior cells as `^` until the player enters the Door or interior. The
lighting field correctly derives source paths from terrain walkability; opening
a Door therefore correctly permits a field contribution inside the Home. The
world renderer then applies that field to the displayed glyph, and the GPU
light pass independently submits additive samples from the same field.

## Goals / Non-Goals

**Goals:**

- Preserve opened-Door light transport and all Door collision behavior.
- Prevent a concealed exterior roof from visually showing source lighting in
  both normal glyph rendering and the GPU composite.
- Restore normal lighting immediately when the Home is revealed on entry.
- Keep the solution compatible with cached lighting fields and incremental
  world rendering.

**Non-Goals:**

- Change lighting radius, shadows, ambient settings, Door state, navigation,
  terrain walkability, or Home generation.
- Introduce interior occlusion geometry, new lighting settings, or a
  cross-building simulation model.
- Change lighting presentation for revealed Home interiors or non-Building
  terrain.

## Decisions

### Treat the roof as a presentation-only light mask

At render time, identify cells whose active Building overlay is the concealed
roof glyph. Those cells use the realm ambient factor for base-glyph submission,
regardless of source contributions in the cached field. This isolates the
visual rule from grid-light calculation so an open Door remains transparent.

The alternative, retaining a non-walkable Door for lighting after it opens,
would incorrectly prevent the interior from being lit after entry and would
couple rendering behavior to collision state. Altering interior terrain
walkability would similarly break movement and navigation.

### Apply the same mask to the GPU light pass

Filter masked roof cells from GPU composite sample submission as well as base
glyph lighting. The GPU pass reads source contributions directly, so base color
masking alone would leave additive glow visible over the roof.

The alternative of mutating cached source fields would force a presentation
concern into reusable lighting data and complicate cache invalidation for
player entry and exit.

### Reuse Building presentation state as the transition boundary

The existing Building presentation lookup already changes from exterior roof
to interior overlay when the player occupies the Door or an interior cell. The
mask follows that same state, so no separate Door/lighting state or persisted
setting is needed. Existing dirty-cell handling for entering and leaving a
Building remains the redraw trigger.

## Risks / Trade-offs

- [A renderer mask could hide only the base lighting] -> Verify both base
  sprite state and GPU sample generation in focused Node coverage.
- [A cached sprite could retain a prior light factor across entry or exit] ->
  Reuse or extend the existing Building presentation dirty-cell invalidation
  so every footprint cell is resubmitted on the exterior/interior transition.
- [A generic mask could affect floor interiors] -> Derive it strictly from the
  active exterior roof presentation, not merely Building membership.

## Migration Plan

No data migration is required. The change is presentation-only and has no
persisted state. Rollback consists of reverting the renderer mask and its
focused tests.
