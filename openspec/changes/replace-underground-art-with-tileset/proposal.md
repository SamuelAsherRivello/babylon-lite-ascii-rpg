# Proposal

## Why

The Underground realm currently conveys its walkable dirt and blocked cave walls through repeated ASCII glyphs, which makes it hard to judge whether a pixel-art treatment would improve the game's atmosphere without changing its procedural gameplay. The supplied dungeon tileset can provide that comparison while preserving generated-world semantics and the existing Babylon Lite renderer.

## What Changes

Current authorized scope: phase two composes a complete **16-tile** wall family
from the new pack's brick face and directional strips. Floor stays fixed tile 13.
Phase-one continuation is approved; phase-two human acceptance remains required.
Phase three delivers an art-refactor and composition-scaling **plan only**.
See [phase-three-art-plan.md](phase-three-art-plan.md).

Historical phase-one revision: phase-one walls use Dungeons-and-Pixels-v1.4 tile 31
and floors use tile 13 from the same sheet. All pack folders remain in the project.
See [new-art-evaluation.md](new-art-evaluation.md) for the replacement assessment;
the source-specific descriptions below record the initial implementation.

- Add an Underground-only terrain-art presentation that substitutes a selected `walls_floor.png` frame for each visible logical `wall` and `dirt` terrain cell. The mapping is presentation-only: `wall` remains blocked and `dirt` remains walkable.
- Implement phase 1 as **1-tile** replacement: one fixed graphic per terrain type (one wall frame plus one floor frame), with no neighbor-based selection. Water, props, actors, pickups, stairs, fog, collision, pathfinding, world generation, and their authoritative glyph identities remain unchanged.
- Require a human visual and gameplay review after phase 1 before any neighbor-aware variants are introduced.
- Use the now-authorized composition of existing source pieces to supply all **16-tile** cardinal patterns. This does not claim 47-tile diagonal inner-corner fidelity. The earlier unmodified-frame audit remains historical evidence, not a blocker on the newly authorized composition.
- Require a second human visual and gameplay review after phase 2 before the change is considered complete.
- Use the project-local `public/assets/images/Dungeons-and-Pixels-v1.4/Tilesets/Tileset_Dungeon.png` as runtime source and its Tiled examples as references. Preserve every supplied folder. Use Babylon Lite sprite atlas/layer APIs, without loading static maps or adding a TMX parser.

## Capabilities

### New Capabilities

- `underground-tileset-terrain`: Presents generated Underground wall and dirt terrain with approved dungeon tileset art, including the staged deterministic and autotiled variants and mandatory human checkpoints.

### Modified Capabilities

- `world-view-rendering`: Permit terrain-art presentation to replace the visual treatment of an eligible logical terrain cell while keeping fog eligibility, world-cell identity, ordering, and view parity intact.

## Impact

- Affected rendering code: the Babylon Lite game layer's atlas, sprite-layer, visible-cell submission, and world-view composition paths.
- Affected assets: the already copied, user-rights-confirmed dungeon pack; composition recipes do not modify its original images.
- No gameplay or world-data schema change, dependency addition, Tiled map loader, static-level migration, or renderer replacement.
- Verification combines focused Node checks, `npm.cmd run build`, and manual fixed-seed browser review at the two required human checkpoints; no Playwright files are added.
