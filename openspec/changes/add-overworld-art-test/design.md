# Design

## Context

See `proposal.md` for the motivation. The existing dungeon source is a 384x288
sheet with a verified 32x32 grid. The outdoor source set has ten PNGs: nine
are 1535x1024 and `1. Grass and dirt.png` is 1672x941. Their title bands,
transparent spacing, and uneven dimensions mean they cannot be truthfully
declared as the dungeon's 32x32 tile grid.

## Goals / Non-Goals

**Goals:**

- Make each supplied outdoor PNG independently visible in Tiled through an
  external tileset file.
- Create a durable, finite five-layer composition that has only a grass/dirt
  base layer.
- Prove a single grass raster can replace one walkable Overworld terrain
  presentation without altering the procedural terrain model.

**Non-Goals:**

- Replacing all Overworld terrain, treating the test map as gameplay data, or
  changing terrain generation, movement, collision, fog, minimap semantics,
  or any Underworld artwork.
- Resampling, cropping, or rewriting the supplied PNG sources to force them
  into a 32x32 grid.

## Decisions

### Use external per-file tilesets and a finite TMX level

The project will place a `.tiled-project` file, a finite TMX test level, and a
`Tilesets/` directory beside the supplied outdoor sources. The map will refer
to external tilesets rather than embed them, matching the requested per-file
authoring model. The source-image geometry will be declared from the actual
sheets and intended artwork regions rather than copied from the dungeon's 32px
grid.

Alternative considered: force all sheets into 32x32 grids. Rejected because
the outdoor assets' dimensions and title/spacing layout would make the result
misaligned and misleading in Tiled.

### Keep the first map layer visual-only and constrain its content

The level will use the ordered layers `Dirt`, `Water`, `Rocks`, `Vegetation`,
and `Details`. Only Dirt receives placed tiles, selected from the grass/dirt
source; the other layers are intentionally saved empty to provide a stable
authoring starting point.

### Add the runtime trial at the presentation boundary

The renderer will load a single grass artwork region and select it only for
one walkable Overworld ground presentation. The logical terrain record remains
the source of truth, so collision, pathfinding, terrain glyphs, fog, lighting,
and the procedural seed remain unchanged.

Alternative considered: mutate a generated cell to a new terrain type.
Rejected because it would couple a visual experiment to generation and
gameplay semantics.

## Risks / Trade-offs

- [Outdoor sheets are not an integral 32px grid] -> Use explicit source
  regions in external tilesets and document the non-parity rather than imply
  compatibility.
- [A high-resolution grass region may not fit the current cell presentation]
  -> Scale only at the renderer boundary and verify it at a fixed seeded
  Overworld URL.
- [Tiled assets could be mistaken for runtime map data] -> Keep all map loading
  out of generation and state this boundary in the authoring spec.

## Migration Plan

1. Add the project, level, and external tileset definitions without moving the
   supplied PNGs.
2. Add the isolated grass-presentation branch and focused coverage.
3. Verify the Tiled project opens and a seeded Overworld renders the grass
   trial while movement and collection remain unchanged.
4. Roll back by removing the presentation branch; the Tiled assets do not
   affect saved settings or generated-world compatibility.
