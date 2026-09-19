# Proposal

## Why

Ascii RPG renders its world as styled glyphs rather than pixel artwork, but
glyph appearance is currently hard-coded in the world model and renderer. A
developer needs one edit-time palette that defines the color and opacity of
every visible Code Page 437 character so visual contrast can be tuned without
changing world-generation or rendering code.

## What Changes

- Establish the final layer ownership for this feature:
  - React owns only `ui_layer` user-interface surfaces: HUD, menus, the Ascii
    Palette window, the Arguments window, fullscreen controls, warnings, and
    other HTML/dialog interactions.
  - React does not own game input, the game loop, procedural generation,
    world state, movement/collision rules, glyph placement, glyph rendering, or
    palette application to in-world cells.
  - Babylon Lite owns the complete `game_layer`: engine canvas lifecycle,
    game input, procedural level generation, ASCII glyph rendering, palette
    application for world glyphs, movement, collision, and all runtime game
    logic.
- Add a complete visible Code Page 437 palette for character values 32–254,
  plus the existing Unicode bullet glyph `•` (U+2022).
- Give every palette entry a glyph value, color, and alpha, defaulting to white
  and fully opaque; do not maintain an allowed/disallowed subset.
- Expand the Ascii Palette window into a compact multi-column grid showing only
  each character index and its styled glyph; the glyph itself communicates its
  current color and alpha.
- Add an anchored character editor with a React color-picker dependency, an
  alpha range control, a live preview, Confirm, and Cancel.
- Apply confirmed palette values immediately to all rendered world glyphs in
  the current game instance.
- In local Vite development, persist confirmed values to the shared static
  palette JSON file; reject the edit if the disk write fails.
- In deployed builds, persist confirmed values to browser `localStorage` and
  show a warning after the first Confirm explaining that the edit is local to
  that browser. Include an unchecked `Hide warning` option.
- Notify other same-origin game instances of confirmed changes so a developer
  can play one instance while editing the palette in another.

## Capabilities

### New Capabilities

- `ascii-palette`: Defines the complete glyph palette, editor behavior,
  default/custom values, persistence modes, React editor ownership, and
  Babylon Lite game-layer rendering updates.

### Modified Capabilities

- `player-grid-movement`: Rendering resolves glyph color and alpha through the
  palette inside Babylon Lite while preserving grid placement, movement, and
  layering. React does not mediate movement or render glyph cells after the
  feature is complete.

## Impact

- Affected application areas include the React `PromptWindow`, React
  `ArgumentsWindow`, Babylon Lite `game_layer` bootstrap, Babylon Lite ASCII
  glyph rendering, Babylon Lite game input and world-cell glyph resolution,
  palette JSON loading/persistence, and focused tests under `ascii-rpg/`.
- Add a React color-picker dependency; the proposed implementation uses
  `react-colorful` and a native controlled range input for alpha. This
  dependency is limited to React UI surfaces and is not part of the Babylon
  Lite game loop.
- Add Babylon Lite as the runtime owner for game rendering and logic. The
  palette editor sends confirmed palette state to Babylon Lite through a narrow
  UI-to-game bridge; Babylon Lite applies those values to the live ASCII scene.
- Add a Vite development-only write endpoint or equivalent local-server hook;
  production GitHub Pages remains static and cannot write repository files.
- Existing `W`, `•`, and `P` rendering moves from hard-coded white drawing to
  Babylon Lite palette-resolved style drawing without changing their world
  roles.
