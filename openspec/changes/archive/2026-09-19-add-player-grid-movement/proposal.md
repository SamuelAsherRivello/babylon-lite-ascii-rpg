# Proposal

## Why

The Ascii RPG currently provides only the browser shell and corner UI, so it
does not yet have a playable entity or a spatial foundation for future RPG
systems. This change establishes the smallest visible gameplay slice: a
screen-sized logical world containing a centered, grid-aligned player that can
move predictably with keyboard input.

## What Changes

- Add a full-viewport game rendering layer with no outer margins.
- Define screen size, logical size, upscale, font resolution, and a `32 x 32`
  logical grid-cell contract.
- Render the player as a single `P` glyph centered in its current grid cell.
- Start the player at the center of the logical viewport.
- Support WASD and arrow-key input for cardinal movement.
- Support simultaneous directional input for all eight movement directions.
- Apply immediate movement on press, a `0.25` second initial repeat delay,
  and `0.125` second subsequent repeat intervals while keys remain held.
- Clamp movement so the player cannot leave the screen-sized world.
- Keep the world bounded to the current logical viewport when the browser
  resizes.

## Capabilities

### New Capabilities

- `player-grid-movement`: Defines the full-screen logical renderer, grid-aligned
  player representation, keyboard movement, repeat timing, diagonals, resize
  behavior, and viewport boundary rules.

### Modified Capabilities

None.

## Impact

- Affected application areas: `ascii-rpg/index.html`, the React application
  entry point and components under `ascii-rpg/src/`, and their focused tests.
- The existing corner UI remains available as a separate UI layer; gameplay
  rendering belongs in the content layer.
- No new runtime dependency is required; the change uses the existing React,
  Vite, and browser APIs.
- Keyboard handling must avoid browser arrow-key scrolling while the game is
  active and must clean up listeners and repeat timers on unmount or key
  release.
