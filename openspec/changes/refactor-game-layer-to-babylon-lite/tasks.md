# Tasks

## 1. Dependency and layer bootstrap

- [ ] 1.1 Add the Babylon Lite runtime dependency and verify package
  installation and import resolution succeed with `npm.cmd test` or a focused
  dependency/import check.
- [ ] 1.2 Replace `content_layer` with `game_layer` in the application shell
  and verify page tests or DOM checks find `game_layer` and `ui_layer`.
- [ ] 1.3 Refactor `main.jsx` so React mounts only into `ui_layer` and the
  Babylon Lite game bootstrap mounts into `game_layer`; verify startup code no
  longer renders a React game component.
- [ ] 1.4 Define the game controller/bridge surface for deliberate UI commands
  and snapshots and verify React cannot directly mutate world, input, or
  renderer internals through that surface.

## 2. Babylon Lite game runtime

- [ ] 2.1 Implement Babylon Lite engine/canvas lifecycle ownership in the game
  bootstrap and verify a game instance can initialize and dispose cleanly.
- [ ] 2.2 Move viewport sizing and resize handling into the Babylon Lite game
  layer and verify full-viewport logical grid sizing remains correct.
- [ ] 2.3 Move keyboard input, held-key state, initial repeat delay, repeat
  interval, and key-release behavior into Babylon Lite-owned game logic and
  verify existing movement timing tests or focused replacements pass.
- [ ] 2.4 Move world startup, `?randomSeed=value` consumption, player start
  placement, movement, collision, and character-layer updates into the Babylon
  Lite game layer and verify generator/movement tests pass.

## 3. ASCII rendering and palette bridge

- [ ] 3.1 Implement Babylon Lite ASCII world rendering for visible cells and
  verify `W`, `•`, and `P` render with character-over-terrain precedence.
- [ ] 3.2 Apply active palette color and alpha inside Babylon Lite rendering
  and verify mixed-style glyphs render independently.
- [ ] 3.3 Keep the Ascii Palette window, color picker, alpha control,
  Confirm/Cancel, warnings, and persistence interactions in React and verify
  palette UI tests still pass.
- [ ] 3.4 Connect confirmed React palette snapshots to the Babylon Lite bridge
  and verify changing `•` and `W` updates the live game world without React
  rendering any world glyph cells.
- [ ] 3.5 Connect Arguments UI/startup argument documentation to Babylon Lite
  startup behavior and verify `?randomSeed=value` still reproduces the same
  generated level.

## 4. Remove legacy canvas runtime

- [ ] 4.1 Remove the React-mounted `GameCanvas` production startup path and
  verify no React component owns the game canvas, input listeners, or draw loop.
- [ ] 4.2 Remove or demote old canvas rendering helpers to tests-only fixtures
  where still useful and verify production imports do not depend on the legacy
  renderer.
- [ ] 4.3 Ensure Babylon Lite/WebGPU initialization failure does not start the
  legacy canvas gameplay fallback and verify the game world remains unloaded in
  that failure path.

## 5. Verification

- [ ] 5.1 Update focused unit tests for pure world generation, movement rules,
  palette validation, and bridge contracts; verify `npm.cmd test` passes.
- [ ] 5.2 Run `npm.cmd run build` and verify the production bundle succeeds.
- [ ] 5.3 Run the Vite app and verify in a real browser that Babylon Lite
  starts in `game_layer`, renders a nonblank generated ASCII world, moves `P`,
  blocks wall movement, honors `?randomSeed=value`, and reflects live palette
  edits from React.
- [ ] 5.4 Validate the OpenSpec change with
  `openspec validate refactor-game-layer-to-babylon-lite --strict`.
