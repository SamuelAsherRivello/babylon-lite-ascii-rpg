# Tasks

## 1. Planning and inventory

- [x] 1.1 Inventory current `ascii-rpg/src/` modules, imports, entry points,
  and `ascii-rpg/test/` coverage before moving files; verify the inventory is
  recorded in the implementation change notes.
- [x] 1.2 Move font and palette data to
  `game-layer-babylon-lite/data/font_data.json` and
  `game-layer-babylon-lite/data/palette_data.json`, then update import paths
  without changing their data contracts; verify the existing font and palette
  tests still pass.

## 2. Client structure

- [x] 2.1 Create sibling `ui-layer-react/`, `bridge-layer/`, and
  `game-layer-babylon-lite/` directories under `ascii-rpg/src/client/`;
  verify all three directories exist at the same depth.
- [x] 2.2 Move React UI modules into `ui-layer-react/` and keep JSX-specific
  code there; verify the React entry renders the existing UI in `ui_layer`.
- [x] 2.3 Move bridge modules into `bridge-layer/` without allowing direct
  UI/game ownership leakage; verify bridge tests cover the existing snapshot
  and command behavior.
- [x] 2.4 Move Babylon Lite modules into
  `game-layer-babylon-lite/`, grouping behavior under explicitly named
  `*-system.js` files; verify game-layer tests pass.
- [x] 2.5 Group player implementation under
  `game-layer-babylon-lite/characters/player/` and preserve the game layer's
  client responsibilities; verify player movement tests pass.
- [x] 2.6 Add representative templates and layer guidance files, ensuring
  templates are not imported by production modules; verify the expected
  extensions and guidance files with a focused structural check.

## 3. Tests and integration

- [x] 3.1 Mirror the relevant `src/` paths under `ascii-rpg/test/` and
  relocate or add tests accordingly, adding `_tests` before each test file
  extension; verify each moved source area has a corresponding test path and
  filename.
- [x] 3.2 Update Vite entry imports, relative imports, test imports, and any
  OpenSpec skill checks that reference old paths; verify no stale source-path
  imports remain.
- [x] 3.3 Verify the existing React UI mount and Babylon Lite game mount
  continue to use their current DOM boundaries; verify with the page test and
  a manual browser check.

## 4. Verification

- [x] 4.1 Run `npm.cmd test` from the repository root and verify it exits
  successfully.
- [x] 4.2 Run `npm.cmd run build` from the repository root and verify the Vite
  build completes successfully.
- [x] 4.3 Run focused structural checks for layer sibling names, template
  files, system naming, JSON data placement, and mirrored test paths; verify
  all checks pass.
- [x] 4.4 Manually verify the browser UI, game startup, player movement,
  palette communication, and failure behavior after the relocation; verify
  the observable behavior is unchanged.
