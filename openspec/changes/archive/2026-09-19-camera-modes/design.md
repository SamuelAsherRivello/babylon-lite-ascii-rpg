# Design

## Context

See `proposal.md` for motivation and behavior scope. The verified runtime has
React in `ui-layer-react`, a narrow `bridge-layer`, and Babylon Lite in
`game-layer-babylon-lite`. The current player-grid module calculates viewport
dimensions and a player-centered origin, while `visible-region.js` clamps a
requested origin to world bounds. The current Settings UI owns fullscreen and
zoom state, and the existing zoom contract describes a non-following viewport.

## Goals / Non-Goals

**Goals:**

- Make camera behavior an explicit, persisted user preference.
- Keep React responsible for the setting surface and Babylon Lite authoritative
  for camera geometry, movement, world state, and rendering.
- Centralize camera-mode calculations so movement, resize, zoom, and rendering
  use the same origin and wrap decisions.
- Cover the three modes with deterministic Node tests that mirror the runtime
  layer boundaries.

**Non-Goals:**

- Adding mouse/drag camera panning or free-look controls.
- Changing world generation dimensions, terrain generation, or palette behavior.
- Adding a new runtime dependency or replacing Babylon Lite's renderer.

## Decisions

### Use a finite mode enum with exact UI labels

Represent the modes with stable values such as `center`, `deadzone`, and `lock`,
and map them to the exact labels `Camera Center`, `Camera Deadzone`, and
`Camera Lock`. Cycling is preferable to a larger settings panel because the
existing Settings area is compact and the user explicitly requested click-to-
cycle behavior. Unknown or invalid stored values fall back to `center`.

### Persist the preference in the React settings layer

React will read and write one local-storage preference using the same browser-
local preference pattern as fullscreen. On initialization and every user
change, it will send a validated camera-mode command through the bridge. React
will not calculate origins or mutate player/world state.

### Keep camera geometry in the Babylon Lite player-grid boundary

The player-grid module will expose camera-mode calculations alongside existing
viewport/origin helpers. A camera state will retain the selected mode and the
current visible origin; a movement result will distinguish a normal move,
camera-origin adjustment, blocked move, and screen wrap. The visible-region
module will continue to enforce valid world bounds after camera calculations.

### Define dead-zone size as viewport percentages

The dead zone will extend 20% of the visible viewport width horizontally and
20% of the visible viewport height vertically from the player, regardless of
zoom. The implementation will convert those percentages to logical cells for
the current viewport and clamp each axis independently for small viewports.
This keeps the behavior proportional to the screen rather than tied to a fixed
cell count.

### Treat Camera Lock as screen wrapping, not world wrapping

`Camera Lock` will preserve the current viewport origin during ordinary movement.
Crossing a visible edge will calculate the corresponding opposite screen cell
and its world coordinate. The destination must still be inside the generated
world and walkable; the permanent non-walkable outer world border therefore
remains authoritative and prevents invalid world wrapping.

### Preserve state during zoom and resize

Zoom and resize will rebuild viewport dimensions without regenerating the world
or resetting the player. The active mode will then resolve the origin using its
own rule: center and dead-zone follow their thresholds, while lock preserves as
much of the existing origin as the new valid bounds allow.

## Risks / Trade-offs

- [Risk] A viewport can be smaller than the percentage dead zone. → Clamp
  each axis independently and test narrow viewport cases.
- [Risk] Existing tests and specs assume a fixed, non-following viewport. →
  Update only the affected movement/zoom requirements and add explicit mode
  coverage so the old behavior is represented by `Camera Lock`.
- [Risk] A screen wrap can target a world border or blocked cell. → Validate
  the wrapped destination before committing movement or advancing world time.
- [Risk] A saved preference from a future or malformed version may be invalid.
  → Validate on load and use `Camera Center` as the safe default.
