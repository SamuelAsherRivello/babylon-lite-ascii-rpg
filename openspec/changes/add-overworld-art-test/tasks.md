# Tasks

## 1. Verify and prepare outdoor authoring assets

- [x] 1.1 Record the source dimensions and selected grass artwork bounds, then verify the Tiled definitions do not claim a false 32x32 dungeon grid
- [x] 1.2 Create the `Nature-and-Outdoor` Tiled project and ten external per-PNG tileset files, then verify all image paths resolve when the project opens in Tiled
- [x] 1.3 Create a finite five-layer test level with Dirt, Water, Rocks, Vegetation, and Details, then verify Dirt contains only grass/dirt tiles and the remaining layers are empty

## 2. Add the isolated Overworld presentation trial

- [x] 2.1 Load the selected grass artwork region at the existing Babylon Lite terrain presentation boundary, then verify it is available without altering generation inputs
- [x] 2.2 Render the selected walkable Overworld ground presentation with the grass artwork while retaining the terrain's authoritative glyph and walkability, then verify focused renderer coverage passes
- [x] 2.3 Confirm objects, actors, fog, lighting, minimap, and mapview retain their established rendering precedence, then verify focused Node tests pass

## 3. Verify the authoring asset and playable result

- [ ] 3.1 Open the Tiled project and test level to verify all ten external tilesets resolve and the saved layer contents match the authoring spec
- [x] 3.2 Build the project with `npm.cmd run build` from the repository root and verify the build succeeds
- [x] 3.3 Manually inspect a fixed-seed Overworld browser run to verify the grass trial is visible and its ground remains walkable; use an explicit `randomSeed` URL argument
- [x] 3.4 Run `openspec validate add-overworld-art-test --strict` and verify the change artifacts validate

## Verification notes (2026-09-27)

- Verified source dimensions, all ten external image references, ordered layer
  names, 96 cells per layer, and permitted tile IDs.
- Tiled's installed `tmxrasterizer.exe` loaded and rendered the map with exit
  code 0; its grass/dirt output was visually inspected. Direct project/editor
  UI inspection (3.1) remains unchecked: native application control is not
  available in this session.
- All 83 focused renderer, world-view, lighting, and minimap tests passed.
- Normal `npm.cmd run build` passed on retry after a transient Windows output
  lock. A fresh-output-directory build also passed.
- Full `npm.cmd test`: 475 passed, 1 failed. The unrelated world-system test
  imports `HEALTH_GLYPH`, which world-system.js does not export.
- Browser inspection with `?skipTutorial=true&randomSeed=codex-overworld-art-test`
  confirmed grass, fog, water, chest/player overlays, and minimap appearance.
  Two upward steps and one leftward step moved the player across grass; the
  clock advanced from 00001 to 00004 and discovery increased from 3% to 4%.
- Strict OpenSpec validation passed. Source PNGs and generation inputs are unchanged.
- Revised the trial to one tightly bounded 212 by 212 dirt tile from the grass
  and dirt sheet. The map now paints only that tile in the upper-left cell;
  all other cells and authoring layers remain empty.
