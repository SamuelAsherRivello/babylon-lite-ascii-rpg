# Design

## Context

See `proposal.md` for motivation. The world generator already creates a
seeded terrain grid, a player start cell, and a separate character grid. The
game layer renders a fixed glyph atlas through Babylon Lite's Sprite2D layer,
and visible characters already take precedence over terrain.

## Goals / Non-Goals

**Goals:**

- Keep torch placement part of authoritative world generation.
- Make torch layouts and density reproducible from the resolved world seed and
  requested torch count.
- Preserve the terrain/character separation and existing movement semantics.
- Make torch positions available in the world data for future lighting
  proposals without introducing a new UI-to-game API.

**Non-Goals:**

- No lighting, shadows, color changes, falloff, animation, sound, interaction,
  pickup behavior, or collision changes.
- No new Babylon Lite scene, mesh, or material system.
- No requirement to expose torch controls in React UI.

## Decisions

- **Screen-relative count:** The game layer calculates the requested count as
  `round(worldArea / visibleScreenArea * 3)` using the zoom-5 visible grid.
  The world generator accepts that count explicitly; a small-world minimum of
  three keeps focused fixtures useful.

- **Placement after terrain acceptance:** Select torches only after the
  generator has accepted the connected terrain and selected the player start.
  This ensures candidates are based on the final walkability and wall layout.

- **Candidate definition:** A candidate is an interior walkable cell with at
  least one cardinal neighbor whose terrain is non-walkable. Exclude the
  player start before selection.

- **Seeded selection:** Reuse the generator's existing seeded random stream or
  an equivalent deterministic derivation from the resolved seed. Shuffle or
  sample the candidate list and take three distinct candidates. Do not use
  `Math.random()` for placement.

- **Failure handling:** The generator SHALL continue rejecting or retrying a
  terrain attempt if the accepted terrain has fewer valid torch candidates
  than requested. This preserves the requested density rather than silently
  creating fewer torches.

- **Character representation:** Store torch glyphs in the existing character
  layer. Keep terrain glyphs and walkability unchanged so later lighting can
  read torch positions without reconstructing the map.

- **Rendering atlas:** Add `T` to the existing Sprite2D atlas and glyph-frame
  list. Keep the current one-sprite-per-cell rendering and palette lookup.

Alternatives considered: storing torches as a separate object list would make
the current visible-glyph precedence more complicated; placing torches in
React would violate game-layer authority; selecting by viewport coordinates
would make resize redraws unstable.

## Risks / Trade-offs

- **[Risk]** Some generation settings may produce too few wall-adjacent floor
  cells. -> Treat the attempt as unsuitable and retry within the generator's
  existing bounded generation process; surface the existing generation error
  if no valid world can be produced.
- **[Risk]** A torch could be overwritten when the player moves. -> Keep torch
  occupancy separate from the player position and ensure movement updates only
  the player character cell.
- **[Trade-off]** Torches represented in the character layer can occupy only
  one character slot per cell. -> This is intentional for the existing
  top-most glyph contract and is sufficient for this non-interactive marker.

## Migration Plan

No persisted worlds or external APIs require migration. Implement the world
data and atlas changes, add focused deterministic tests, then verify the
existing test suite, production build, and manual browser rendering. The
change can be rolled back by removing torch placement and the `T` atlas frame.
