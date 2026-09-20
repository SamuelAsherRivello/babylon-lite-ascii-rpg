# Design

## Context

See proposal.md for motivation. The current Babylon Lite game layer submits
the game viewport through a sprite layer while `renderMinimap` independently
computes a crop, rasterizes glyphs, applies fog checks, and paints markers on a
2D canvas. `fog-of-war-system.js` already owns per-realm discovery and
`glyph-visual-cache.js` already provides reusable glyph visuals.

## Goals / Non-Goals

**Goals:**

- Establish one world-view composition path with explicit source and
  destination rectangles.
- Make fog eligibility identical and mandatory for the game view and mini-map.
- Preserve Babylon sprite rendering, game lighting, mini-map scaling, and
  mini-map-only marker overlays through view parameters.
- Keep discovery authoritative in gameplay and persistent for the active realm.
- Preserve bounded viewport culling and reusable glyph-cache behavior.

**Non-Goals:**

- Do not change world generation, movement, camera-mode semantics, fog radius,
  line-of-sight rules, or realm lifecycle behavior.
- Do not move world, fog, lighting, or per-cell rendering state into React or
  the bridge.
- Do not make the mini-map and game view share a single crop; each receives an
  explicit source rectangle.
- Do not add new rendering dependencies or replace Babylon Lite.

## Decisions

1. **Use a parameterized world-view renderer.** Create a reusable renderer or
   renderer module that receives world state, fog state, source world bounds,
   destination bounds, scale, target-layer hooks, and optional capability
   hooks. This matches the confirmed requirement that one instance can perform
   everything while arguments determine which behavior is active. Keeping
   separate render loops was rejected because it permits fog and composition
   drift; a renderer hard-coded to one surface was rejected because Babylon
   sprites and the mini-map canvas have different submission APIs.

2. **Share cell eligibility and composition, adapt submission.** The shared
   path will iterate only the clamped source rectangle, reject undiscovered
   cells before world drawing, resolve the same visible glyph, and preserve
   background-then-glyph ordering. Target adapters will convert the shared cell
   result into Babylon sprite updates or canvas raster draws. This preserves
   crisp cached glyphs without forcing both targets to use the same primitive.

3. **Keep fog as world state, not view state.** Each generated realm retains
   one fog record. Movement and realm activation invoke discovery once; game
   and mini-map redraws only query that record. A per-view fog toggle or
   render-time discovery pass was rejected because it would make visibility
   differ between views.

4. **Make capabilities explicit arguments.** Lighting, target-specific scaling,
   and marker overlays are enabled through the view request. The game view
   enables its configured lighting submission; the mini-map can disable world
   lighting, use its own scale, and enable its marker overlay. Marker handling
   remains optional and runs after shared world content.

5. **Preserve explicit independent crops.** The game and mini-map requests
   each carry their own source `x`, `y`, `width`, and `height`, plus destination
   geometry. This retains current player-centered mini-map zoom behavior while
   allowing matching crops to prove parity and different crops to remain
   independent.

## Risks / Trade-offs

- [Risk] A shared path could add overhead to the current fast Babylon sprite
  path → Mitigation: keep visible-region culling, glyph caching, incremental
  sprite updates, and target-specific submission state outside the cell
  composition data.
- [Risk] The canvas mini-map and Babylon sprite layer have different raster
  semantics → Mitigation: share eligibility, glyph identity, pass order, and
  raster source while retaining small target adapters.
- [Risk] Applying fog to the game view can hide cells that were previously
  visible → Mitigation: the player's current cell is discovered by the
  existing movement rule, and focused tests will verify initial discovery,
  movement persistence, and matching visibility in both views.
- [Risk] Existing minimap parity wording assumes the game crop → Mitigation:
  revise the parity requirement to specify explicit per-view source rectangles
  and test both matching and independent crops.

## Migration Plan

Implement the shared composition contract first, then route the game view and
mini-map through it while preserving their existing target submission details.
Remove or reduce duplicated mini-map world-cell composition only after parity
and fog tests pass. Rollback is a scoped revert of the new renderer routing;
world generation and fog data remain compatible because discovery storage and
rules are unchanged.

