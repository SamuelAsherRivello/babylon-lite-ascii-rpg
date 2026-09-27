# Phase-two verification — 2026-09-26

## Latest revision: architectural walls

The earlier 16-tile notes below are historical. The revised implementation uses
3x3 rectilinear Underground blocks plus 47 gated-diagonal recipes derived from
wall_combinations01.tmx: 14 canonical whole-frame choices and 33 composed forms.
The source example is not itself a full 47-tile set, and two demonstrated
neighborhoods have stylistic alternatives resolved deterministically.

Verification: 72 focused rendering/generation/map tests passed; the main suite
passed all 495 tests, including the five new wall tests in its default command.
Build and strict OpenSpec validation passed. The new tests cover all 256 raw
neighborhoods/47 normalized masks, exact source mapping provenance, recipe
bounds/coverage, diagonal and border behavior, conservative rectangular blocks,
disabled caves, sync/cooperative parity, and unchanged Overground terrain.
Generation fixture hashes intentionally changed with Underground and paired
stairs; existing stair validity/repeatability tests pass.

Live fixed-seed preview: walked from spawn toward a wall, confirmed blocked
movement (five down inputs advanced only four ticks at the edge), walked around
its side and front, and checked the updated minimap at two scales. Screenshot:
`C:/Users/srive/.codex/visualizations/2026/09/26/01a0dd58-b385-7cd2-8a58-a7ac3623ade5/underground-rectilinear.png`.
The same preview URL below serves the revised build. The contact-sheet script
now displays all 47 recipes and the same structural fixtures.

Trade-offs for human review: opening mixed blocks preserves passages but reduces
wall density; later water/connectivity operations can alter block boundaries.
Dark interiors are also part of the source art, not necessarily undiscovered fog.
Full stair/overlay live regression and every rare shape in actual gameplay are
still pending; diagnostic fixtures are not substitutes for those checks.
Phase three remains a plan, not an implemented migration.

## Implemented result

Sixteen cardinal wall patterns are composed from the new dungeon sheet. Floor
remains tile 13. Source folders/images are untouched; no TMX runtime dependency.
Selection uses logical neighbors, including beyond the viewport; borders connect
outward. The cache key includes the mask. Neighbor dirty updates reach game,
minimap and mapview. PNG lighting and fog behavior remain unchanged.

The user's instructions to proceed with phase two using the new art and to
compose what is needed authorize this continuation. Final human phase-two
acceptance has not been given.

## Automated/build evidence

- Focused rendering suite: 24 passed, including all sixteen masks, deterministic
  cache reuse, source bounds, world borders, viewport-independent selection,
  fog/occupancy independence, and affected-neighbor invalidation.
- Combined rendering, world-view, world-view-cache, and minimap suites: 62 passed.
- `npm.cmd run build`: passed (normal large-chunk warning).

## Visual evidence

`preview-composed-walls.ps1` imports the actual runtime recipe and renders
phase-one/phase-two pairs for solid blocks, 2x2 clusters, isolated walls,
horizontal/vertical strips, T-junctions, concave corners, diagonal contacts,
and world borders. All sixteen outputs were inspected. This is a diagnostic
fixture, not a claim that every configuration was encountered in live gameplay.

Fixture image:
`C:/Users/srive/.codex/visualizations/2026/09/26/01a0dd58-b385-7cd2-8a58-a7ac3623ade5/composed-wall-fixtures.png`

Live preview:
`http://127.0.0.1:5176/babylon-lite-ascii-rpg/?randomSeed=underground-phase1&skipTutorial=true&generationOverrides=disable:2,4,10,11,15,16`

Actual browser smoke checks: Underground loads; successful movement advances
time, movement into the wall does not; fog and minimap update; expanded map
opens/closes; zoom changes; hero and floor/wall art remain visible. Live screen:
`C:/Users/srive/.codex/visualizations/2026/09/26/01a0dd58-b385-7cd2-8a58-a7ac3623ade5/underground-phase2.png`

## Remaining review / limitations

- Human phase-two acceptance remains open.
- The full live acceptance matrix is not complete: isolated/2x2 formations were
  verified in recipe fixtures, not each in the playable seeded world. Stair
  traversal and every overlay interaction were not rechecked in this session.
- Cardinal-only artwork cannot distinguish diagonal inner corners. Thin walls
  have trim on both exposed sides; the human should judge their visual weight.
- Current bounded composite atlas is suitable for this limited experiment;
  broader overlay/terrain combinations need the phase-three separation plan.
