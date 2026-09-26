# Dungeons and Pixels v1.4: replacement and qualification

## Latest revision: both terrain types

The user subsequently requested redoing phase one for both floor and wall.
The active floor is now ID 13 `(32,32,32,32)`, neutral stone paving without
moss, props, or perimeter trim; the wall remains ID 31 `(224,64,32,32)`.
Both use one decoded project-local dungeon sheet. The old PNG is preserved
but is no longer loaded by this renderer. The wall-only comparison below is
historical. This revised pair awaits human review; auto-tiling remains off.

Verification for the revised pair: 21 focused renderer tests, production build,
and strict OpenSpec validation passed. The preview server returned HTTP 200,
but the in-app browser rejected navigation with ERR_BLOCKED_BY_CLIENT, so a
fresh visual check of this pair is not claimed. Previous screenshots below
show the historical wall-only revision. Human gate 3.1 is reopened.

## Source choice

The user requested this new-art comparison on 2026-09-26. All supplied folders
remain intact under `ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/`:
Characters, Enemies, Items, Props, Tiled_Examples, and Tilesets.
Use **Tilesets** for runtime PNGs and **Tiled_Examples** for authoring reference.
`Tiled_Examples/Tilesets/Tileset_Dungeon.tsx` points to
`../../Tilesets/Tileset_Dungeon.png`: there is no separate Tiled-only PNG to copy.
These assets already reside in the project, not at an external linked location.
The TSX defines a 384x288 sheet, 32px cells, 12 columns, 108 slots, and animation
sequences for liquids. It does not declare terrain/Wang mappings.
The example TMX is a hand-authored 15x15 room layout, not runtime world data.

## Applied phase-one wall

Use zero-based local **tile ID 31**, `(224,64,32,32)`: opaque blue-gray brick face.
It fills the whole cell without the transparent cutouts of the perimeter pieces
or the prominent top cap on ID 1. Repeat it deterministically for every eligible
Underground wall, in all three views. The old floor `(128,224,16,16)` remains
unchanged; the two logical terrain kinds now select their own source sheets.
No neighbor selection, changes to fog/lighting, gameplay, or new dependencies.

## Four tile-count options

These are source-art/selection strategies, not Tiled editor versions. In
particular, fewer source tiles can produce detailed results through composition.

| Label | New pack assessment | Implementation consequence |
| --- | --- | --- |
| 1-tile | Supported directly by ID 31; now applied. | Repeat one wall face, no neighbors. |
| 5-tile | No qualified transformed dual-grid family supplied. Directional wall shading and narrow trim make arbitrary rotation inappropriate. | Derive compatible source pieces and use a different composition layout; not a drop-in selection table. |
| 16-tile | Useful ingredients, but no complete qualified one-frame-per-wall-cell family. IDs 6-11, 18-23, 30-35, 47, 59 show room caps, strips, ends and turns; many contain empty space or rely on neighboring rows. | Most practical next experiment: compose a consistent 16-pattern atlas using the solid face and selected trim, then seam-test every mask. Cardinal-only selection cannot distinguish diagonal inner corners. |
| 47-tile | Not supplied as a complete compatible blob family. 108 sheet slots include floors, empty space, stairs, and animated liquids—not 108 wall variants. | Needs a derived corner-aware family (possibly assembled from quarters), all gated-diagonal forms, and full seam qualification. |

The example PNG confirms an architectural, layered room treatment: raised front
faces, thin side/rear borders, and decorated floor. That attractive result is not
equivalent to replacing arbitrary blocked cells with existing full-size frames.
For example ID 19 is empty/dark, ID 21 is a narrow vertical wall between empty
areas, and ID 31 is a full face. Treating them as interchangeable connected-wall
variants would change apparent wall thickness and introduce gaps.

Recommendation: retain this 1-tile comparison for human review. If approved,
seek approval to derive a **16-tile** wall family from the new pack; preserve
walkable floors and keep all composed trim inside blocked cells. A 47-tile
upgrade is a separate, higher-effort qualification. Neither has been implemented
or certified by this inspection; phase-two tasks remain open.

`audit-new-art.ps1` produces a labeled, nearest-neighbor contact sheet of all
108 slots. The original-pack audit remains historical evidence, not an audit
of this replacement.

## Verification

21 focused renderer tests passed, including explicit wall/floor source routing
and crop coordinates. Production build passed (after allowing Vite subprocesses
past a sandbox EPERM); strict OpenSpec validation passed. In the fixed-seed
preview at `http://127.0.0.1:5176/babylon-lite-ascii-rpg/?randomSeed=underground-phase1&skipTutorial=true&generationOverrides=disable:2,4,10,11,15,16`,
Underground showed the new brick wall faces and unchanged floor. Down-arrow
movement advanced Time 00001 to 00003 and revealed more terrain; the minimap
updated. Screenshot: `new-wall-phase1.png` in this session's visualization folder.
This is a replacement-art smoke check, not renewed human acceptance or phase-two
completion. OpenSpec remains 7/12 tasks complete, with the phase-two gate open.
