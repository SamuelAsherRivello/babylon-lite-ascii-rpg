# Proposal

## Why

The game can lock or crash the browser as soon as a player clicks a React menu control. The current Babylon Lite render loop can submit work continuously while UI input, resize, and renderer updates contend for the main thread and GPU, leaving the React HUD unable to respond.

## What Changes

- Make Babylon Lite rendering demand-driven and frame-coalesced so a completed world does not continually resubmit unchanged sprites.
- Establish a safe renderer lifecycle for startup, resize, visibility changes, teardown, and device errors without retaining a legacy gameplay fallback.
- Preserve all gameplay, fog, minimap, palette, font, zoom, camera, realm, lighting, and GPU-light systems while ensuring React menu actions remain interactive.
- Remove implicit first-click fullscreen behavior; fullscreen remains an explicit user setting.
- Add focused runtime and browser interaction validation for every left-side menu action, rendering updates, and recovery boundaries.

## Capabilities

### New Capabilities

- `interactive-render-stability`: Keeps the Babylon Lite frame lifecycle bounded and UI interaction responsive while every game system remains available.

### Modified Capabilities

- `game-layer-architecture`: Define responsive UI interaction and a stable Babylon Lite lifecycle without a legacy gameplay fallback.
- `zoomed-glyph-rendering`: Require frame submission and redraw scheduling to remain bounded when world state is unchanged or UI controls are used.
- `responsive-ui-layout`: Require menu controls to remain operable without implicit fullscreen activation.

## Impact

- Affected runtime: Babylon Lite game-layer scheduling/lifecycle, React fullscreen behavior, and the narrow bridge only where lifecycle-safe commands require it.
- Affected validation: focused game-layer and UI tests plus manual browser interaction coverage.
- Dependencies: no new runtime dependency or alternate gameplay renderer.
