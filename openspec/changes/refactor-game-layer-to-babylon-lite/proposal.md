# Proposal

## Why

Ascii RPG currently runs the playable game through a React-mounted 2D canvas
component, so React owns too much of the game runtime: input, loop scheduling,
movement, generation hookup, and rendering. The project needs a clear final
architecture where React is the UI layer and Babylon Lite is the game layer.

## What Changes

- **BREAKING** Replace the React-owned `content_layer` game runtime with a
  Babylon Lite-owned `game_layer`.
- Mount React only into `ui_layer` for HUD, menus, settings, dialogs, the
  Ascii Palette window, the Arguments window, fullscreen controls, warnings,
  and other HTML user-interface surfaces.
- Add Babylon Lite as the runtime owner for the engine canvas lifecycle, render
  loop, game input, procedural level generation, world state, movement,
  collision, glyph placement, ASCII glyph rendering, and palette application to
  in-world cells.
- Remove the old React-mounted canvas gameplay path as a runtime fallback. If
  Babylon Lite or WebGPU cannot initialize, the game world does not load.
- Preserve the Ascii Palette feature as a cross-layer feature:
  - React owns the palette window, color picker, alpha controls, confirmation
    and warning UI, and palette persistence interactions.
  - Babylon Lite owns rendering the game world with the confirmed palette
    values.
- Establish a narrow React-to-Babylon Lite bridge for deliberate UI commands
  and confirmed data snapshots, such as palette commits and arguments/settings
  changes. Babylon Lite remains authoritative for game state and input.
- Keep `?randomSeed=value` as a game argument, but move argument consumption
  into the Babylon Lite game startup path while React may continue to describe
  it in the Arguments UI.
- Maintain the existing playable behavior: generated cave world, `W` walls,
  `•` floors, `P` player, grid movement, held-key repeat timing, wall
  collision, and character-over-terrain rendering precedence.

## Capabilities

### New Capabilities

- `game-layer-architecture`: Defines the final ownership boundary between
  React `ui_layer` and Babylon Lite `game_layer`, including startup failure,
  UI-to-game communication, and no legacy canvas fallback.

### Modified Capabilities

- `player-grid-movement`: Movement, input, and player rendering remain the
  same user behavior but are owned by Babylon Lite instead of React/canvas.
- `procedural-level-generation`: Generated world behavior remains the same, but
  generation is invoked and rendered through Babylon Lite's game layer.

## Impact

- Affected application areas include `ascii-rpg/index.html`, `src/main.jsx`,
  `src/GameCanvas.jsx`, the world/grid modules, palette store integration,
  tests under `ascii-rpg/test/`, and package dependencies.
- Add the Babylon Lite dependency used by the application runtime.
- React remains a dependency for UI surfaces and `react-colorful` remains
  limited to the palette editor.
- The old canvas gameplay component should be removed from the production
  startup path rather than retained as a compatibility fallback.
- Browser compatibility changes: browsers/devices without working
  Babylon Lite/WebGPU support do not load the game world.
