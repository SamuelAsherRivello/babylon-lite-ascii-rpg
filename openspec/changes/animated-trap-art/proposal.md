# Proposal

## Why

Traps currently render as a static `☠` glyph despite the project already carrying the selected Dungeons & Pixels animated trap artwork. After the successful hero-sprite visual test, replacing that placeholder makes traps readable as hazards while preserving their established gameplay behavior.

## What Changes

- Replace the visible in-world Trap glyph with the project-local `trap1_strip.png` artwork.
- Animate each visible active trap continuously through all seven 32×32 source frames in a forever loop.
- Preserve the glyph as a load-failure fallback, and preserve all existing Trap generation, movement, collision, health-consequence, logging, minimap, and preview behavior.
- Render animated Trap art only for cells that are in the active game-view source region and have positive fog visibility.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `procedural-level-generation`: Define the visible in-world animated Trap artwork, its continuous loop behavior, fog/region eligibility, and glyph fallback while retaining the existing static-object and gameplay contracts.

## Impact

- Affected code: Babylon Lite game-view cell presentation, the particle/effects overlay, and related focused rendering tests.
- Asset: existing `ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/Props/Animated/trap1_strip.png` only.
- Dependencies and public APIs: no additions or changes.
