# Design

## Context

The Babylon Lite game layer currently uses an image overlay for the animated
hero, while living enemies remain world glyphs supplied by dynamic occupancy.
The supplied Spider asset set already contains separate Idle, Move, Attack,
and Death frame sequences. See `proposal.md` for the product motivation.

## Goals / Non-Goals

**Goals:**

- Add a presentation-only Spider overlay lifecycle for every living enemy.
- Map authoritative enemy movement, attack, and death outcomes to visual state
  transitions without changing the enemy simulation contract.
- Retain final death-frame records for the current realm session without making
  them gameplay entities.

**Non-Goals:**

- Changing enemy health, damage, AI, navigation, spawning, or occupancy.
- Replacing the `S` enemy-spawner art or changing the spawner lifecycle.
- Adding NPC art, NPC behavior, saved corpses, or cross-session persistence.

## Decisions

### Separate presentation records from enemy occupancy

The game layer will maintain presentation records keyed by enemy id while the
enemy is alive, then convert a zero-health enemy event into a detached corpse
record keyed by its realm and final cell. Living records read position and
facing from authoritative occupancy; detached records must never be inserted
into occupancy or the time system.

This extends the existing hero-overlay style of DOM image presentation without
changing the renderer's world-data authority. Rendering a Spider directly as a
world glyph raster was rejected because the supplied art is a frame sequence
and needs independent animation timing.

### Derive visual state only from committed enemy outcomes

Enemy state becomes `idle` by default, `move` only after a successful
occupancy move, `attack` only after an actual enemy attack resolves, and
`death` when the enemy's authoritative health reaches zero. Move and attack
sequences return to idle when complete; death clamps to its final frame.

The existing enemy simulation remains the single authority for cadence,
pathfinding, damage, and removal. This avoids a second actor state machine
that could alter or duplicate gameplay decisions.

### Retain corpses for the current realm visit

Detached death records remain stored while their realm stays active, including
when their cells are outside the current viewport or fogged. The presentation
layer renders them only when their cells are viewable, but never prunes them
for offscreen status. Realm activation transitions clear records for the realm
being left, and initial page load starts with none.

Keeping records in runtime memory meets the requested in-realm persistence
without adding localStorage or save-format migration. Storing them in the
world model was rejected because that would blur non-interactive presentation
with occupancy and lifecycle data.

### Preserve existing spawner and NPC boundaries

Only entities whose type is `enemy` receive Spider overlays. Enemy spawners
retain their existing glyph rendering, and NPC code paths do not receive
presentation changes.

## Risks / Trade-offs

- [Overlay state can become stale after enemy removal] -> Convert only the
  explicit zero-health death event into a corpse record; remove any living
  record when authoritative occupancy no longer contains its id.
- [Several live or dead spiders increase DOM overlay work] -> Reuse overlay
  elements and update only viewable cells during scheduled presentation work.
- [Visible glyph and overlay could overlap] -> Suppress the underlying living
  enemy glyph in the game view when its Spider overlay is active, while leaving
  existing minimap and mapview glyph contracts intact.
- [A realm transition leaves stale corpses] -> Clear detached records at the
  transition boundary and cover leave-and-return behavior with focused tests.

## Migration Plan

No persistent data, public API, or dependency migration is required. Rollback
is limited to removing the presentation integration; existing enemy
simulation and spawner behavior remain independently intact.
