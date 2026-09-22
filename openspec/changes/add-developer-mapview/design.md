# Design

## Context

See proposal.md for motivation. The current app has React-owned lower-left Windows and Info sections in `App.jsx`, and Babylon Lite owns the `game_canvas`, `minimap_canvas`, world generation, fog state, lighting, input, entity simulation, and shared world-view rendering. The shared world-view functions already support separate source and destination rectangles, glyph collection, and target-specific draw callbacks. The minimap draws into its own canvas, uses world-view composition, then draws marker overlays and optional quest edge indicators.

## Goals / Non-Goals

**Goals:**

- Add a `Map` launcher under the Info section without exposing mutable world state to React.
- Reuse the existing world-view composition path for a third presentation target named mapview.
- Render the active realm fullscreen with fog bypassed and effective ambient lighting fixed at `1`.
- Draw in-world diagnostic markers for starts, player position, quest objects, torches, items, enemies, and spawners.
- Suppress gameplay keyboard input while the mapview is open.
- Keep the player-facing minimap behavior unchanged, including fog and quest edge indicators.

**Non-Goals:**

- Do not add panning, interactive keyboard navigation, editing tools, or persistence for mapview state.
- Do not change procedural generation, enemy simulation, object ownership, or quest selection.
- Do not make React render world cells, fog fields, entity collections, or diagnostic marker positions.

## Decisions

### Use a game-layer mapview surface

Add a dedicated mapview presentation path owned by the Babylon Lite game layer. React should only open and close the overlay through narrow bridge commands or controller methods. Babylon Lite should create or manage the mapview canvas/presentation surface because it already owns world state, renderer resources, glyph caches, lighting, and marker projection.

Alternative considered: render the mapview as a React canvas fed by a world snapshot. That would violate the current architecture by sending mutable world/entity data into React and would duplicate the renderer.

### Reuse world-view composition with target-specific parameters

Build the mapview from the same `createWorldViewComposition`, `collectWorldViewGlyphs`, and `renderWorldViewComposition` path used by the game view and minimap. The mapview should supply a full-realm source rectangle and destination bounds computed from the overlay size. The mapview fog resolver should report full visibility for every source cell without mutating the real fog object.

Alternative considered: copy minimap-specific rendering and remove fog checks. That would risk another divergent rendering path and make glyph, object, and enemy precedence drift over time.

### Force diagnostic lighting at render time

Mapview rendering should use an effective ambient factor of `1` for its world content and skip player/torch/GPU light-pass darkening. This is a view parameter, not a mutation of the active lighting preferences. Existing game and minimap lighting should continue unchanged while the mapview is open and after it closes.

Alternative considered: temporarily set active realm ambient to `1` before rendering and restore it on close. That would risk stale lighting state, extra bridge churn, and accidental visible changes in the live game view.

### Derive markers in the game layer

Create a mapview marker projection that can reuse minimap marker colors/order where appropriate but expands marker sources for developer diagnostics. Include player start, current player, quest-owned objects, torches, active pickup/items, enemies, and spawners. Exclude minimap edge indicators entirely because the full realm is intended to fit onscreen in landscape.

Alternative considered: extend the minimap marker function directly to always include every diagnostic entity. That would endanger the player-facing minimap contract, which intentionally hides many non-quest objects and uses fog-gated markers.

### Gate keyboard input centrally

When the mapview is open, the game layer should ignore keyboard-driven gameplay actions in the existing key handlers or input state dispatch path. Closing the mapview should clear any held movement state and resume normal input handling. Pointer/close interaction may remain UI-owned, but gameplay keyboard input should not pass through while open.

Alternative considered: rely on DOM focus trapping alone. That is brittle because the game layer listens at `window` level today.

## Risks / Trade-offs

- [Risk] Rendering the full 512x512 realm with glyph rasterization could be expensive. -> Use cached glyph rasters, fit-to-screen cell sizing, render only on open/resize/state refresh, and verify browser responsiveness.
- [Risk] Marker density may be high and hard to read. -> Keep the first implementation to minimap-style solid markers and stable draw order; richer filtering can be a later change.
- [Risk] Fog bypass could accidentally update discovery if wired through normal discovery helpers. -> Use a read-only visibility resolver for mapview and add focused tests that discovery state remains unchanged.
- [Risk] Keyboard input may leak through if only the overlay handles focus. -> Add game-layer input gating and a test around movement keys while mapview is open.

## Migration Plan

No data migration is required. Ship behind the Developer Info UI as a normal client feature. Rollback is removing the `Map` launcher and mapview bridge/rendering path; existing game, minimap, and lighting behavior should remain compatible because their contracts are unchanged.
