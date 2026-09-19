# Design

## Context

See `proposal.md` for motivation. The current application mounts
`GameCanvas` as a React component into `content_layer` and mounts `App` into
`ui_layer`. `GameCanvas` owns window keyboard listeners, held-key repeat
timing, viewport calculation, world creation, player movement, palette
subscription, and 2D canvas text drawing. The palette editor already lives in
React and commits palette snapshots through `palette-store.js`.

The target architecture keeps React for UI but moves gameplay and rendering to
Babylon Lite. Babylon Lite is a new runtime dependency for this project and is
treated as the owner of the game layer, not as a drawing helper hidden inside a
React component.

## Goals / Non-Goals

**Goals:**

- Replace `content_layer` with `game_layer` as the game surface container.
- Start Babylon Lite from a non-React game bootstrap module.
- Keep React mounted only to `ui_layer`.
- Move game input, repeat timing, world generation startup, movement,
  collision, render-loop ownership, glyph placement, ASCII rendering, and
  palette application into Babylon Lite-owned modules.
- Preserve React ownership of HUD/menu/dialog UI, including the Ascii Palette
  window and its color picker.
- Provide a narrow bridge where React sends confirmed palette snapshots and
  deliberate UI commands or argument/settings changes to Babylon Lite.
- Remove the legacy React/canvas runtime fallback.

**Non-Goals:**

- Replacing the React UI with Babylon Lite UI.
- Keeping the current 2D canvas renderer as a browser compatibility path.
- Changing the visual roles of `W`, `•`, or `P`.
- Adding monsters, scrolling cameras, combat, or new level-generation rules.
- Solving unsupported WebGPU devices beyond not loading the game world.

## Decisions

- **Game bootstrap outside React:** `main.jsx` should initialize the Babylon
  Lite game layer against `#game_layer` and mount React separately against
  `#ui_layer`. This prevents React lifecycle/reconciliation from owning the
  engine lifecycle. Alternative considered: wrap Babylon Lite in a React
  component. That matches some React/Babylon.js examples, but it weakens the
  explicit layer boundary requested for this project.
- **Rename the runtime container:** Replace the HTML `content_layer` with
  `game_layer`. The old name was intentionally generic for template content;
  the new name communicates that a game engine owns this layer.
- **Babylon Lite owns input:** Move keyboard listeners, held-key state, repeat
  timers, and movement dispatch into the game layer. React may expose controls
  or settings, but it should not mediate player movement. This keeps gameplay
  timing independent from React renders.
- **World model can remain testable but game-owned:** The existing pure world
  generation and movement helpers may be reused or reorganized, but Babylon
  Lite startup owns when generation runs, which world instance is active, and
  how cells are rendered. This avoids mixing “pure logic is testable” with
  “React owns game state.”
- **ASCII rendering through Babylon Lite:** Render each visible cell as a
  Babylon Lite-managed glyph primitive, text primitive, sprite/glyph-atlas
  instance, or equivalent Babylon Lite-supported path. The implementation may
  choose the exact primitive after inspecting the installed Babylon Lite API,
  but every in-world glyph must be driven by Babylon Lite, not by canvas
  `fillText` in React.
- **Palette split across layers:** React owns the Ascii Palette UI, including
  the grid/window, `react-colorful`, alpha control, Confirm/Cancel, warning UI,
  and persistence interactions. Babylon Lite owns applying the active palette
  to world glyphs. Confirmed palette snapshots flow through the bridge and
  trigger Babylon Lite render updates.
- **Bridge shape:** Expose a small game controller or event bridge with
  commands such as `setPalette(snapshot)`, `setArguments(snapshot)`, and
  `dispose()`. The bridge should not expose mutable world internals to React.
- **Startup failure:** If Babylon Lite or required browser rendering support
  cannot initialize, do not run the old canvas game. React UI may still mount,
  but the game world remains unloaded.

## Risks / Trade-offs

- [Babylon Lite API details differ from assumptions] -> Inspect the installed
  dependency before implementation and keep the renderer adapter small enough
  to revise without changing the specs.
- [Text-heavy rendering can become expensive if each glyph is a heavy object]
  -> Prefer a glyph atlas, sprite batching, instancing, or the lightest
  Babylon Lite text path available; add a browser smoke check for a nonblank
  generated level.
- [Removing the canvas fallback reduces compatibility] -> This is intentional:
  unsupported devices do not load gameplay rather than maintaining two
  renderers.
- [React and Babylon Lite can drift on palette state] -> Treat the palette
  store as the persistence/source snapshot and push confirmed snapshots through
  the bridge; Babylon Lite owns the live rendered application of that snapshot.
- [Existing Node tests import canvas-facing modules] -> Split pure logic tests
  from engine integration tests so generator and movement behavior remain
  unit-testable while browser verification proves Babylon Lite rendering.

## Migration Plan

1. Add the Babylon Lite dependency and inspect its package entry points.
2. Rename `content_layer` to `game_layer` in the HTML and CSS integration
   points.
3. Replace the React `GameCanvas` mount with a game bootstrap module that
   initializes Babylon Lite in `game_layer`, returns a controller/bridge, and
   exposes disposal for tests or hot reload.
4. Move keyboard handling, repeat timing, world startup, movement, collision,
   and rendering into Babylon Lite-owned game modules.
5. Wire React palette commits to the bridge so React keeps owning the editor
   while Babylon Lite updates rendered glyph styles.
6. Preserve `?randomSeed=value` by passing startup arguments into the Babylon
   Lite game layer.
7. Remove the old React/canvas runtime fallback from production startup.
8. Update focused unit tests for pure generator/movement/palette behavior and
   add browser verification for Babylon Lite startup, nonblank ASCII world
   rendering, movement into walls, and live palette updates.

Rollback is to revert this change's scoped files and restore the previous
React-mounted canvas startup. There is no data migration beyond package and
source changes.

## Open Questions

None for the current scope.
