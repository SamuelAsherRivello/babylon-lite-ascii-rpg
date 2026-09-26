# Proposal

## Why

The Underground realm currently conveys its walkable dirt and blocked cave walls through repeated ASCII glyphs, which makes it hard to judge whether a pixel-art treatment would improve the game's atmosphere without changing its procedural gameplay. The supplied dungeon tileset can provide that comparison while preserving generated-world semantics and the existing Babylon Lite renderer.

## What Changes

- Add an Underground-only terrain-art presentation that substitutes a selected `walls_floor.png` frame for each visible logical `wall` and `dirt` terrain cell. The mapping is presentation-only: `wall` remains blocked and `dirt` remains walkable.
- Implement phase 1 as **1-tile** replacement: one fixed graphic per terrain type (one wall frame plus one floor frame), with no neighbor-based selection. Water, props, actors, pickups, stairs, fog, collision, pathfinding, world generation, and their authoritative glyph identities remain unchanged.
- Require a human visual and gameplay review after phase 1 before any neighbor-aware variants are introduced.
- Qualify the supplied art before choosing phase 2: select a **47-tile** blob mapping only if the art supports all required seams and corners; otherwise select a complete **16-tile** cardinal mapping if supported. Neither tier is currently proven by the sheet's frame count. If neither qualifies, retain phase 1 and report the missing forms before extending scope. A **5-tile** approach remains a reference alternative requiring compatible art and separate composition design, not the default for this pack.
- Require a second human visual and gameplay review after phase 2 before the change is considered complete.
- Treat `Tiled_files` as the source-art and frame-selection reference. The runtime SHALL use Babylon Lite sprite atlas/layer APIs; it SHALL NOT replace procedural generation with the supplied static Tiled map or add a generic TMX runtime parser.

## Capabilities

### New Capabilities

- `underground-tileset-terrain`: Presents generated Underground wall and dirt terrain with approved dungeon tileset art, including the staged deterministic and autotiled variants and mandatory human checkpoints.

### Modified Capabilities

- `world-view-rendering`: Permit terrain-art presentation to replace the visual treatment of an eligible logical terrain cell while keeping fog eligibility, world-cell identity, ordering, and view parity intact.

## Impact

- Affected rendering code: the Babylon Lite game layer's atlas, sprite-layer, visible-cell submission, and world-view composition paths.
- Affected assets: approved PNGs copied from the supplied `Tiled_files` folder, subject to confirming the package's distribution terms before public release.
- No gameplay or world-data schema change, dependency addition, Tiled map loader, static-level migration, or renderer replacement.
- Verification combines focused Node checks, `npm.cmd run build`, and manual fixed-seed browser review at the two required human checkpoints; no Playwright files are added.
