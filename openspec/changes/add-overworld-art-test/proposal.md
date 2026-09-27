# Proposal

## Why

The new Nature-and-Outdoor source sheets need a safe authoring and rendering
trial before they can replace procedural Overworld presentation. The project
needs a Tiled project that makes every source PNG inspectable, plus one
walkable-terrain visual substitution that proves the art can travel through the
existing renderer without changing gameplay data.

## What Changes

- Add a standalone Tiled Overworld-art test project, a finite level, and one
  external tileset definition per Nature-and-Outdoor PNG.
- Add five ordered map layers: Dirt, Water, Rocks, Vegetation, and Details.
  Populate only Dirt with grass/dirt artwork; leave the other four empty.
- Render one selected Overworld walkable-ground presentation with a grass
  raster while retaining its existing terrain identity, walkability, fog,
  collision, and procedural generation behavior.
- Record the source-sheet parity finding: the dungeon tileset is an integral
  32x32 sheet, while the supplied outdoor PNGs are presentation sheets with
  non-32-aligned dimensions. The trial therefore uses explicitly defined
  tileset geometry rather than claiming 32px source parity.

## Capabilities

### New Capabilities

- `overworld-tiled-art-test`: Provides a Tiled-inspectable outdoor-art test
  level and external source-PNG tilesets without making Tiled level data an
  Overworld generation input.

### Modified Capabilities

- `world-view-rendering`: Allows one selected walkable Overworld terrain
  presentation to use a grass raster while preserving the authoritative cell
  data and shared view eligibility rules.

## Impact

- Adds Tiled-only assets under `ascii-rpg/public/assets/images/Nature-and-Outdoor/`.
- Updates the Babylon Lite terrain presentation path and focused rendering
  coverage only; no new dependency, map loader, static-level migration, or
  gameplay-rule change is introduced.
