# Proposal

## Why

Health changes currently update logs, HUD bars, and enemy health bars, but the world view does not show immediate signed feedback at the entity that was affected. Floating text will make damage and healing legible in-place while preserving Babylon Lite as the owner of gameplay simulation and in-world rendering.

## What Changes

- Add a game-view-only floating text overlay for signed health deltas.
- Render damage as red text such as `-2`, `-3`, or `-25`.
- Render healing as green text such as `+2` or `+10`, using the actual applied clamped delta.
- Create a separate floating text instance for every visible health-change event, with independent fade and upward motion timing.
- Gate creation to entities currently rendered in the game world view so offscreen, fogged, or inactive-realm tick simulation does not allocate floating-text records.
- Add dedicated floating-text style ownership, including a `floating-text.css` stylesheet and `.floating_text...` class namespace for any DOM-backed presentation wrapper or related UI/debug affordance.

## Capabilities

### New Capabilities

- `floating-text`: Defines transient game-view floating text for visible signed health-change feedback.

### Modified Capabilities

- `world-view-rendering`: Add floating text as a game-view-only overlay that is not part of minimap or shared world-cell composition.
- `game-layer-architecture`: Clarify that Babylon Lite owns floating-text health-change presentation and must keep tick simulation decoupled from overlay creation.

## Impact

- Affected code: Babylon Lite game-layer health-change paths, world-view overlay rendering, renderer resource lifecycle, and focused tests under `ascii-rpg/test/client/game-layer-babylon-lite/`.
- Affected UI/style files: add dedicated `floating-text.css` ownership and import it through the existing UI stylesheet path if a DOM-backed class is needed.
- No new runtime dependency is expected.
- React remains outside entity health, floating-text records, and world-view overlay ownership.
