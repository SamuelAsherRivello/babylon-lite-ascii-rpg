# Design

## Context

See `proposal.md` for motivation and
`specs/character-y-depth-sorting/spec.md` for the behavioral contract. The
Babylon Lite game view currently draws terrain and normal glyphs in the canvas
world-view pass, renders enemies in one absolute DOM overlay, and renders the
hero in another absolute DOM overlay. Those separate stacking contexts make
their fixed CSS order win even when an NPC or another character is lower on
the map.

## Goals / Non-Goals

**Goals:**

- Give all visible player, enemy, and NPC presentations one sortable game-view
  depth domain.
- Derive depth exclusively from authoritative occupancy/player grid cells, then
  apply a stable fallback for equal y values.
- Preserve the current art, animation, fog eligibility, and overlay geometry.

**Non-Goals:**

- Change character movement, occupancy, combat, generation, or collision.
- Depth-sort terrain, props, particles, health bars, floating text, minimap,
  or mapview content.
- Add a rendering dependency, change the world-view composition API, or expose
  a user-facing setting.

## Decisions

### Use one character presentation overlay

Create a dedicated game-view character overlay above terrain but below the
existing UI/presentation overlays that must remain global. Put the hero,
animated enemy elements, and NPC character element(s) in that shared stacking
context. NPCs must no longer depend on the canvas glyph pass for their
game-view character appearance while this overlay is active; their base glyph
remains authoritative for palette lookup and non-game views.

This lets CSS `z-index` compare individual characters directly. Retaining the
hero and enemy in separate parent overlays cannot implement cross-parent
y-ordering, and using DOM insertion order would cause unnecessary element
churn and is less explicit.

### Centralize depth-key construction

Add a small presentation helper that accepts visible character records and
returns a deterministic front-to-back ordering key. The primary key is the
authoritative world-cell `y`, with a stable identifier-based fallback for
equal-y records. Assign the resulting key to every individual overlay element
on each reconciliation/render pass, including the hero animation pass.

The helper remains presentation-only and consumes immutable snapshots or
read-only actor records. It does not write world or occupancy state. A focused
unit test can therefore verify greater-y precedence, equal-y stability, and
the absence of mutation without browser automation.

### Keep non-character passes unchanged

The existing canvas world-view pass continues to provide terrain and to
suppress the replaced game-view character glyphs. Fog and camera eligibility
remain the source of which character records are passed to the overlay.
Existing particles, health bars, floating text, reticle, and transition mask
retain their current pass order and CSS ownership.

## Risks / Trade-offs

- [An overlay record can become stale during movement or realm transition] →
  reconcile the shared character overlay from current visible actor records on
  every existing render/animation update and remove records outside the active
  visible realm.
- [An overlay NPC glyph can differ from its canvas presentation] → reuse the
  existing palette glyph appearance/offset rules and verify player, enemy, and
  NPC presentation against the same viewport geometry.
- [Frequent depth updates add DOM style work] → update existing retained
  elements in place and limit reconciliation to the visible character set.

## Migration Plan

1. Add focused depth-key and character-overlay tests before or alongside the
   presentation refactor.
2. Move player, enemy, and NPC game-view character rendering into the shared
   overlay, preserving current fog and frame behavior.
3. Apply y-based depth keys during normal rendering, movement, camera, and
   realm-transition reconciliation.
4. Run focused Node tests and `npm.cmd run build`, then manually verify a
   seeded game view with overlapping player/enemy/NPC positions.

The change is local presentation code with no persistent data or migration.
Rollback is a normal source revert of the scoped implementation before a
release; no world-state conversion is necessary.
