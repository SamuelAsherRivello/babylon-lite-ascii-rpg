# Design

## Context

See [proposal.md](proposal.md) for motivation. The client has a procedural
two-realm world whose terrain cells retain logical `kind`, glyph, walkability,
and fog state. Its Babylon Lite game layer already rasterizes glyphs into
sprite atlases and submits visible cells through bounded world-view
composition. The supplied package provides a 16px dungeon atlas and a static
Tiled reference map, while the existing Stealth Grid project demonstrates
Babylon Lite sprite-atlas/layer rendering for Tiled-authored assets.

## Goals / Non-Goals

**Goals:**

- Add a visual-only Underground terrain skin with no change to generated world
  data or game rules.
- Stage work so a human evaluates the simple one-to-one treatment before
  autotiling adds visual complexity.
- Reuse the established bounded world-view, fog, lighting, atlas, and sprite
  submission paths across all world views.

**Non-Goals:**

- Loading the supplied TMX map at runtime, creating static levels, or replacing
  procedural generation.
- General-purpose TMX/TSX support, a new rendering engine, or a dependency.
- Replacing water, objects, creatures, pickups, stairs, effects, or UI glyphs.
- Altering collision, walkability, navigation, terrain destruction, fog, or
  random-seed determinism.

## Decisions

### Phase-one source approval and mapping (2026-09-26)

The user confirmed full rights to include these assets in the game and its
public repository. A byte-for-byte copy of `Tiled_files/walls_floor.png` lives
in `ascii-rpg/src/assets/underground/`; there is no external runtime link.
The selected 16x16 frames use zero-based source pixel coordinates: wall
`(32,64)` (dark stone blocks), dirt `(128,224)` (lighter flat paving).
Both were inspected in an enlarged nearest-neighbor preview. Phase one uses
these fixed frames only; this does not qualify any phase-two tile family.

The bounded glyph atlas caches terrain plus glyph-overlay composites, keyed
by terrain kind and the existing facing/offset glyph key rather than cell
coordinates. The two terrain families reserve bounded additional capacity.
Game sprites and canvas maps consume the same full-cell rasters. Palette or
font changes invalidate composites; fog and light remain presentation inputs.

### Render from logical terrain, not rendered glyphs

Frame selection will inspect the active realm's terrain-cell `kind` and its
neighbors. The renderer will never infer a wall or dirt cell from the visible
glyph. This preserves authoritative world data and separates presentation from
movement, fog, collision, and pathfinding.

Alternative: replace glyph constants during generation. Rejected because it
would couple gameplay contracts and palette behavior to one art experiment.

### Use a curated runtime atlas from `Tiled_files`

The approved frame mapping will be documented from `walls_floor.png`; only the
required runtime PNG asset(s) are copied into the project after distribution
terms are confirmed. Tiled is used to inspect source frames and prepare a
small reference palette, not to define each generated world.

Alternative: parse `Dungeon1.tmx` directly. Rejected because the supplied map
is static, infinite, XML-based, and embedded-tileset content, while this
project needs a compact generated-cell presentation adapter.

### Phase 1 is 1-tile replacement per terrain type

All visible Underground `wall` cells use one selected wall frame; all visible
Underground `dirt` cells use one selected floor frame. This makes visual,
performance, fog, and overlay regressions easy to isolate.

Alternative: introduce a random frame variation in phase 1. Rejected because
it would make the human comparison and fixed-seed verification less clear.

### Phase 2 selects a method after qualifying the art

The source directory is `C:/Users/srive/Downloads/World_1_Realm_-1_TileSet/Tiled_files`.
Inspection found a 272x464 `walls_floor.png` (17x29 slots at 16px), plus
`decorative_cracks_walls.png` (8x32 slots). These counts include decoration,
architectural pieces, and empty regions; they do not establish an autotile set.
The earlier visual assessment identified candidate edges and corners, but did
not prove a complete 16-tile or 47-tile family. Both remain unqualified until
the frame audit below is completed.

After phase-one human acceptance, document exact atlas coordinates and preview
adjacent tiles for solid blocks, a 2x2 cluster, isolated walls, single-cell
strips, ends, T-junctions, concave corners, diagonal contacts, and world borders.
Record unsupported forms explicitly. Choose the highest supported tier:

- **47-tile:** eight-neighbor blob mask with diagonals counted only when both
  adjoining cardinal neighbors connect. Require coverage of all 47 normalized
  patterns and seamless fixtures before selecting this tier.
- **16-tile:** four-cardinal-neighbor mask with all 16 patterns mapped. This
  tier accepts its inherent inability to distinguish diagonal inner corners;
  document that limit in the human review rather than promising blob fidelity.
- **Neither qualifies:** keep the accepted 1-tile implementation, report exact
  missing forms, and leave phase two unfinished pending revised art or scope.

Do not assume rotations preserve the directional shading of dungeon walls.
Any reused, flipped, or rotated frame must pass the seam and lighting audit.
The **5-tile** label refers to compact source-art techniques, not a fidelity
rank: the linked five-tile technique uses transformed dual-grid tiles, while
quarter-tile composition is another approach. Neither is proven compatible
with this pack. Introducing either requires revisiting this design.

The selected resolver reads logical wall neighbors, never fog visibility or
actor occupancy. Read neighbors beyond the viewport and treat out-of-world
neighbors as walls to continue the blocked border. If terrain changes, update
the affected cell and its eight neighbors. Frame selection is deterministic
and separate from persistent world data and generation randomness.

Alternative: apply a full Wang-tile or terrain-set solver. Rejected for this
experiment because it expands asset-authoring and solver scope beyond the
available dungeon frames.

### Reference material

These are technique references, not runtime dependencies or proof that this
pack supplies the required art:

- https://excaliburjs.com/blog/Autotiling%20Technique/ - neighbor masks and atlas lookup.
- https://ceramic-engine.com/examples/auto-tiling/ - expanded 47-tile example.
- https://github.com/tlhunter/node-autotile - two-terrain mask-to-frame reference.
- https://daily.dev/posts/implementing-auto-tiling-with-just-5-tiles-go7xwoub9 - compact dual-grid alternative.
- https://github.com/jimbojw/hexlib - hex-grid reference, outside this square-grid design.
- https://www.redblobgames.com/articles/autotile/claude/ - interactive comparison of masks and composition strategies.

### Keep human checkpoints as implementation gates

Phase 1 ends with focused checks, build, and a manual browser session using a
fixed `randomSeed`, followed by explicit human approval. Phase 2 cannot begin
until that decision. Phase 2 repeats those checks with maps that exhibit
centers, edges, corners, and isolated walls and similarly ends with explicit
human approval.

## Risks / Trade-offs

- [Art-frame selection is visually unsuitable at the game's zoom range] ->
  validate at the supported zooms during phase 1 and revise only the two
  approved mappings before phase 2.
- [Atlas art becomes illegible at minimap scale] -> verify game, minimap, and
  mapview parity in each human checkpoint; adjust the shared destination-scale
  presentation without changing logical cell identity.
- [Per-cell frame selection causes extra presentation work] -> resolve only
  the bounded visible or dirty region and preserve existing atlas reuse and
  culling behavior.
- [The package has distribution conditions] -> inspect and record the supplied
  license/coupon terms before copying assets into a public deliverable.

## Migration Plan

1. Add phase-one assets and renderer support behind the existing world-view
   presentation boundary; generated saves and URLs require no migration.
2. Verify and obtain phase-one human approval.
3. Qualify the available art, record the selected tier and limitations, then
   implement that mapping; verify and obtain phase-two human approval.
4. If either review rejects the treatment, remove only the new art
   presentation and assets; the generated world and gameplay state remain
   compatible because they were never changed.
