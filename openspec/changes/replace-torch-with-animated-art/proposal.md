# Proposal

## Why

Torches currently use a static candle glyph despite the project already carrying
the authored Dungeons & Pixels three-frame torch artwork. Replacing that game-view
glyph with the animated strip will improve world readability while retaining the
stable torch world state used by generation and lighting.

## What Changes

- Render a generated Torch in the game view with the existing `torch_strip.png`
  artwork as a three-frame looping animation, anchored to the Torch's logical
  grid cell.
- Keep the existing Torch catalog glyph, grid coordinate, walkability,
  non-interactive behavior, fog eligibility, lighting-source behavior, and
  minimap marker behavior authoritative and unchanged.
- Reconcile animated Torch presentation to the active game-view visible region:
  only active-realm, fog-eligible, visible Torches have renderer resources or
  animation updates.
- Provide a game-layer-owned pause/resume capability for the visible Torch
  animator. This change does not add a player-facing setting or persisted
  preference.
- Preserve the existing static glyph path as a fallback if the raster asset
  cannot be loaded.

## Capabilities

### New Capabilities

- `animated-torch-presentation`: Defines animated Torch artwork, its visible
  game-view lifecycle, pause behavior, and fallback presentation.

### Modified Capabilities

- `random-torch-placement`: Torches retain their stable catalog glyph and
  generation semantics while their main game-view presentation may use the
  animated raster artwork.

## Impact

- Affected Babylon Lite game-view rendering and Torch presentation lifecycle in
  `ascii-rpg/src/client/game-layer-babylon-lite/`, plus focused tests under the
  mirrored client test tree.
- Uses the existing project-local
  `public/assets/images/Dungeons-and-Pixels-v1.4/Props/Animated/torch_strip.png`
  asset; no dependency, world-generation, React bridge, or minimap rendering
  replacement is introduced.
