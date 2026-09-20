# Design

## Context

The React UI owns persisted preferences and the game layer owns the minimap canvas and its pointer events. Minimap clicks need a dedicated, hidden minimap-scale state; they must not reuse or modify the existing game zoom state.

## Goals / Non-Goals

**Goals:**

- Make minimap clicks select only the ordered scales `1`, `5`, and `10`.
- Keep the minimap scale, browser preference, and rendered minimap synchronized without rendering its value.
- Remove the minimap event listener when the game layer is disposed.

**Non-Goals:**

- Moving the player or camera to the clicked minimap location.
- Changing the existing game zoom preference, Settings buttons, or game viewport bounds.
- Adding Playwright coverage under the repository browser-test policy.

## Decisions

### Keep minimap scale separate from game zoom

The game controller will expose a focused minimap-scale selection callback. `main.jsx` will connect it to a dedicated bridge snapshot, which the React UI uses to update a hidden `minimapZoom` state and persist it under its own local-storage key. The bridge reapplies the snapshot to a newly-created game controller.

This preserves the UI/bridge/game-layer separation and avoids the game layer writing local storage or importing React state. Reusing the existing game zoom snapshot was rejected because a minimap click must not change the game viewport.

### Zoom the rendered minimap content inside its established footprint

The game layer will map the current minimap scale to the next item in `[1, 5, 10]`, with `10` wrapping to `1`. The canvas keeps its established on-screen width, height, and corner placement at every level. Instead, rendering selects a player-centered portion of the minimap and expands that content to fill the unchanged canvas: scale `1` shows the full map, while scales `5` and `10` show progressively smaller areas. No numeric scale text is added.

The alternative of changing the game viewport was rejected because the user explicitly scoped the interaction to the minimap.

### Use a pointer/click listener only while the minimap is visible

The minimap canvas will own the listener so every canvas coordinate produces the same scale action. Hidden canvases will neither be interactive nor emit a scale selection. Disposal will unregister the listener alongside the existing canvas input cleanup.

## Risks / Trade-offs

- [A two-way notification can echo a minimap-scale update back to the controller] → The controller's equality guard prevents redundant style updates, and bridge/UI listeners will be registered and released with lifecycle cleanup.
- [The scale is intentionally undiscoverable as a number] → The interaction stays click-only, as requested; no label is added.

## Migration Plan

No stored-value migration is needed: a dedicated minimap-scale key defaults to `5` when absent. Rolling back removes the click interaction while leaving the game zoom preference unchanged.
