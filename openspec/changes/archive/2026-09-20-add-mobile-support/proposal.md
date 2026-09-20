# Proposal

## Why

The game renders on mobile browsers but its interface is not reliably usable
after a landscape or portrait resize: grouped palette cards can overflow,
dialogs have excessive fixed insets, and the lower-left HUD can exceed a
short landscape frame. Player movement also has no touch input.

## What Changes

- Make the four-corner HUD, Ascii Palette, and Font editor adapt cleanly to
  landscape and portrait viewports while retaining the established visual
  treatment and all UI controls.
- Ensure every grouped palette glyph card contains both its identity and glyph
  in portrait, without fixed ten-column overflow or horizontal scrolling.
- Compact the short-landscape HUD without scrolling so Windows and Settings
  remain visible inside the shared four margins.
- Add canvas-only pointer swipe movement in all eight directions. A threshold
  crossing moves once immediately; holding continues with the existing
  keyboard repeat cadence, while release, cancellation, resize, or rotation
  stops touch-held movement.

## Capabilities

### New Capabilities

- `responsive-ui-layout`: Defines orientation-aware HUD and editor layout that
  keeps the complete UI visible and usable on mobile-sized viewports.

### Modified Capabilities

- `ascii-palette`: Require responsive grouped palette cards and a usable Font
  editor in portrait.
- `player-grid-movement`: Add eight-way canvas swipe and swipe-hold movement
  alongside the existing keyboard controls.

## Impact

- Affected source: React UI markup/styles and the Babylon Lite game-layer
  input lifecycle.
- Affected tests: focused UI/source tests and player-grid movement tests, plus
  browser verification in representative portrait and landscape orientations.
- No new dependencies, persistence format, network API, or world-generation
  behavior are introduced.
