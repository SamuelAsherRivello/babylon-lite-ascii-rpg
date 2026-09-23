# Design

## Context

See `proposal.md` for motivation and the spec deltas for observable behavior.
The generated world stores terrain cells with kind, glyph, walkability, and
color. The Babylon Lite game layer resolves dynamic combat before movement,
then handles door interaction and terrain walkability. Existing attack turns
own Offense scaling, stamina cost, attack experience, and world-time advance.
Health bars, floating text, and log entries are also owned by the game layer;
React receives only existing UI snapshots.

## Goals / Non-Goals

**Goals:**

- Make interior Overground mountains damageable targets in the movement
  collision path without changing the player position during a hit.
- Keep terrain health, destruction, and rendering updates authoritative in the
  Babylon Lite game layer.
- Reuse the established combat turn and transient damage presentation rules.
- Preserve indestructible world edges and all non-mountain collision behavior.

**Non-Goals:**

- Digging Underground walls, water, fences, or doors.
- Persisting world terrain changes across newly generated game sessions; the
  current generated world has no saved terrain format.
- Adding a separate digging control, React state, or a new runtime dependency.

## Decisions

### Store mountain health on terrain cells

Initialize current and maximum health to `100` on interior Overground mountain
cells when the generated realms are prepared. Keep the health alongside the
cell's existing terrain properties so realm changes retain damage within the
current world. Give border cells the `▒` glyph before marking interior
mountains as diggable; border cells remain non-walkable and have no health.

An alternative would be a separate occupancy entity for every mountain. That
would incorrectly mix terrain with characters and dynamic occupancy, and could
change pathfinding, placement, and collision rules for unrelated systems.

### Resolve digging in the existing player collision turn

Keep dynamic enemy and spawner collision handling intact. Before ordinary
walkability rejects a destination, dispatch an interior Overground mountain
hit through the player combat turn, using its existing Offense calculation,
stamina cost, attack experience, and one world-time advance. Submit the terrain
damage event to the existing log, floating-text, and health-bar presenters.
Return after the hit even if it is lethal; a later input sees a walkable cell
and uses normal movement.

Creating an independent input action or doing the mutation in React would split
gameplay ownership and risk applying both damage and movement on one input.

### Convert a destroyed cell to the existing Overground grass profile

At zero health, update the same terrain cell to the normal Overground grass
kind, glyph, color, and walkable state, then schedule the normal game,
minimap, and map-view updates. Keep the player stationary for the lethal hit.
Normal movement and discovery update when the player later enters the cell.

### Use stable terrain identity for transient feedback

Use a terrain-target identity derived from realm and cell coordinates for
damage presentation. Supply health, maximum health, previous health, cell, and
realm to the existing generic health-bar and floating-text paths, while
continuing to route messages through the Log System. Do not register mountains
in dynamic occupancy or enemy tick simulation.

## Risks / Trade-offs

- [Repeated movement input can dig several times] -> Resolve at most one full
  attack turn per normal movement trigger, preserving the existing held-input
  cadence and never moving on the lethal hit.
- [A destroyed tile can leave stale terrain-dependent views] -> Update the
  active game view, minimap, and map-view from the same terrain mutation and
  refresh lighting where the movement renderer requires it.
- [The wall glyph may also be used Underground] -> Apply the `▒` distinction
  only to the Overground outer border; do not alter Underground wall cells.

## Migration Plan

No saved-world migration is required. Mountain health is initialized for each
newly generated world and is retained only for that world's in-memory realm
data. The OpenSpec CLI remains a development-only project dependency and is not
included in the browser build.
