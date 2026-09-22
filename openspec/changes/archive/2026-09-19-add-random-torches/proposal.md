# Proposal

## Why

The generated ASCII levels currently contain only walls, floor, and the
player, which makes the world visually uniform and leaves no stable in-world
landmark for future lighting experiments. Adding torches without lighting
first creates a small, independently testable world-decoration capability and
establishes the torch positions that the later lighting proposals can consume.

## What Changes

- Add lowercase `T` torch characters at a density targeting approximately
  three torches per visible screen at the default zoom level 5.
- Derive the generated torch count from the world area and the visible grid
  area supplied by the game layer, with small test worlds retaining a minimum
  of three torches.
- Select torch positions pseudo-randomly from the generated level's resolved
  seed so the same level seed reproduces the same torch layout.
- Require every torch to occupy a walkable cell immediately orthogonally
  adjacent to at least one wall cell.
- Prevent torch placement on the player start cell or on duplicate cells.
- Preserve torches across player movement and world redraws, including resize
  redraws that reuse the level seed.
- Add the `T` glyph to the Babylon Lite glyph atlas while preserving the
  existing single-visible-glyph-per-cell rule.
- Do not add lighting, shadows, falloff, animation, collision behavior, or
  torch interaction in this change.

## Capabilities

### New Capabilities

- `random-torch-placement`: Defines deterministic screen-relative placement of
  non-interactive torch glyphs in generated levels.

### Modified Capabilities

- `procedural-level-generation`: Extends the character layer and visible glyph
  contract to support `T` torch characters in addition to `P`.

## Impact

- Affected client code includes the world-generation system and Babylon Lite
  game-layer entry point under `ascii-rpg/src/client/`.
- Focused world-generation tests will cover density-derived count, placement
  validity, determinism, player avoidance, and visible glyph precedence.
- No new dependency, storage format, URL argument, network behavior, or UI
  bridge API is required.
- Later lighting changes should consume the torch positions rather than
  reimplement placement.
