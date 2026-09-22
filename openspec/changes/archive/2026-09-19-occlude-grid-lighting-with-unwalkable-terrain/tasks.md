# Tasks

## 1. Plan the terrain cases

- [x] 1.1 Replace the old wall/floor equal-light assertion with fixed terrain fixtures in `lighting_tests.mjs` for an open ray, a lit blocking cell, a cell behind a wall, medium and deep water, a closed diagonal corner, and an alternate unblocked source; verify the blocked cases fail with the current distance-only scene lighting.

## 2. Implement terrain-aware source light

- [x] 2.1 Add a deterministic straight supercover visibility check in `lighting.js` that reads terrain walkability, excludes the target as an intervening blocker, and treats corner-touching and out-of-bounds cells as opaque; verify the focused terrain fixtures pass.
- [x] 2.2 Apply visibility to both torch and player contributions while retaining their independent `Off`/`Low`/`Med`/`High` profiles, Euclidean radius and falloff, strongest-source overlap, and ambient blend; verify focused tests for radius boundaries, source overlap, and ambient `0`/`1` pass.

## 3. Integrate bounded visible rendering

- [x] 3.1 Build visible-region source fields using only sources whose bounded radii intersect the region, with separate reusable torch and player results; verify tests cover region bounds and invalidation for player movement, profile changes, viewport changes, and a new world.
- [x] 3.2 Use the same field in full and changed-cell rendering in `index.js`, preserving the existing local movement-refresh edit; verify rendering tests show old player light clears, new shadows appear, and a changed glyph uses the current lighting factor without rewriting terrain or palette data.

## 4. Verify the change

- [x] 4.1 Run `npm.cmd test`, `npm.cmd run build`, and strict OpenSpec validation from the repository root; verify each exits successfully and address any regression before completion.
- [x] 4.2 Inspect the running game in a browser with ambient `0` and `1`, both source types, walls, and available blocked water at multiple zooms; verify straight shadows, lit source-facing blockers, alternate-source lighting, unchanged controls, and no light trail after moving. Check first-render and zoom timing logs against their existing targets and resolve any material regression.

## 5. Expose fixed source presets

- [x] 5.1 Replace the four source profiles with fixed `Off`, `Low`, `Med`, `High`, and `X High` profiles, increasing the non-off values and recording the shared full-occlusion and zero-bleed shadow values.
- [x] 5.2 Show compact `R`, `M`, `F`, `O`, and `B` values in both source-setting labels while preserving independent stored selections and bridge commands.
- [x] 5.3 Extend focused lighting tests, run the Node suite, build, strict OpenSpec validation, and manually inspect the five-preset cycle in the running settings panel.

## 6. Vary source shadow presets

- [x] 6.1 Add independent five-preset Torch Shadow and Player Shadow controls with stored selections, bridge commands, and compact `O` and `B` labels.
- [x] 6.2 Carry the selected shadow profile through the lighting client and apply its `O` and `B` values to source light behind unwalkable terrain.
- [x] 6.3 Cover the separate progressive shadow settings with focused tests, then run the Node suite, build, strict validation, and inspect the visible labels in the running game.
