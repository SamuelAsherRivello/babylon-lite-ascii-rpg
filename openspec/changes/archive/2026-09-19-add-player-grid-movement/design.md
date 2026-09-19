# Design

## Context

The existing application has a React/Vite entry point, an HTML
`content_layer` reserved for game content, and a separate React `ui_layer` for
the corner controls. There is no current game loop, renderer, player model, or
input system. See `proposal.md` for the motivation and externally visible
scope; the capability contract is in
`specs/player-grid-movement/spec.md`.

## Goals / Non-Goals

**Goals:**

- Establish a small browser-native rendering and input foundation that can be
  extended with future world entities.
- Keep logical coordinates independent from physical viewport pixels so
  `upscale` can change without changing gameplay coordinates.
- Preserve the existing UI layer and keep gameplay content in the content
  layer.
- Make movement timing and boundary behavior deterministic enough for focused
  automated checks.

**Non-Goals:**

- Camera scrolling or a world larger than the viewport.
- Collision with terrain, enemies, items, or other entities.
- Smooth interpolation between cells.
- Touch controls, gamepad controls, or configurable key bindings.
- New rendering or input dependencies.

## Decisions

### Use a browser canvas for logical ASCII rendering

Render the gameplay layer to a canvas sized to the viewport and draw the
logical scene using a monospace font. Maintain the logical canvas dimensions as
`screen / upscale`, then scale the canvas output to the viewport. Canvas keeps
the glyph placement and scaling under one coordinate system and avoids making
the browser DOM layout responsible for grid-cell geometry.

An HTML grid of positioned elements was considered, but it would couple the
rendering contract to viewport rounding and create unnecessary DOM work as the
world grows.

### Keep gameplay state separate from the existing React corner UI

Add the game view through the existing `content_layer` while leaving the
corner UI rendered through `ui_layer`. React owns the game view lifecycle, but
the player cell, resize state, pressed-key state, and repeat scheduling remain
gameplay concerns rather than UI preference state.

### Represent movement as integer grid coordinates

Store the player position as integer cell coordinates. Convert a direction
vector of `-1`, `0`, or `1` per axis into a candidate cell, reject or clamp
out-of-bounds candidates, then render the accepted cell. Combining two
orthogonal held directions produces one diagonal candidate without any
continuous-position or diagonal-speed special case.

### Use explicit key state and repeat scheduling

Track the mapped direction keys currently held, prevent default browser
scrolling for handled arrow keys, and clean up listeners and timers when the
game view is removed. A key press applies the immediate step, schedules the
`0.25` second delayed step, and then schedules `0.125` second repeats. The
current set of held directions is read for each trigger so diagonal movement
and direction release take effect without restarting the game.

### Treat resizing as a logical-viewport update

Observe viewport size changes, recompute the logical dimensions, resize the
canvas backing store, and clamp the integer player coordinate to the valid
visible cell range. The initial position uses the center cell of the current
logical viewport.

## Risks / Trade-offs

- [Viewport dimensions may not divide evenly into `32`-unit cells] -> Keep
  logical pixel dimensions exact, derive the valid cell range from the full
  cell footprint, and leave any unusable remainder as non-playable edge space.
- [Canvas text metrics vary between platforms] -> Use a monospace font and
  center the measured glyph within its cell; test cell placement and gameplay
  behavior rather than relying on a specific rasterized glyph shape.
- [Browser key auto-repeat could duplicate movement] -> Suppress reliance on
  native repeat events and use the explicit timing schedule for held keys.
- [Focus may be outside the game] -> Attach handling at the game view/window
  boundary and limit prevention to mapped gameplay keys; clean up all handlers
  on unmount.

## Migration Plan

No data migration is required. Add the gameplay canvas and movement behavior
behind the existing page shell, run focused tests and the production build,
then verify the full-screen result in a browser at multiple viewport sizes.
Rollback consists of reverting the scoped gameplay source and test changes;
the existing corner UI remains independently usable.
