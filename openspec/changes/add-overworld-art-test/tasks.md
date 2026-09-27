# Tasks

## 1. Verify and prepare outdoor authoring assets

- [ ] 1.1 Record the source dimensions and selected grass artwork bounds, then verify the Tiled definitions do not claim a false 32x32 dungeon grid
- [ ] 1.2 Create the `Nature-and-Outdoor` Tiled project and ten external per-PNG tileset files, then verify all image paths resolve when the project opens in Tiled
- [ ] 1.3 Create a finite five-layer test level with Dirt, Water, Rocks, Vegetation, and Details, then verify Dirt contains only grass/dirt tiles and the remaining layers are empty

## 2. Add the isolated Overworld presentation trial

- [ ] 2.1 Load the selected grass artwork region at the existing Babylon Lite terrain presentation boundary, then verify it is available without altering generation inputs
- [ ] 2.2 Render the selected walkable Overworld ground presentation with the grass artwork while retaining the terrain's authoritative glyph and walkability, then verify focused renderer coverage passes
- [ ] 2.3 Confirm objects, actors, fog, lighting, minimap, and mapview retain their established rendering precedence, then verify focused Node tests pass

## 3. Verify the authoring asset and playable result

- [ ] 3.1 Open the Tiled project and test level to verify all ten external tilesets resolve and the saved layer contents match the authoring spec
- [ ] 3.2 Build the project with `npm.cmd run build` from the repository root and verify the build succeeds
- [ ] 3.3 Manually inspect a fixed-seed Overworld browser run to verify the grass trial is visible and its ground remains walkable; use an explicit `randomSeed` URL argument
- [ ] 3.4 Run `openspec validate add-overworld-art-test --strict` and verify the change artifacts validate
