# Design

## Context

See `proposal.md` for motivation. The current game layer already owns world rendering, health mutation, enemy/spawner damage callbacks, player lifecycle, object consequences, and in-world health-bar presentation. `world-view.js` composes bounded visible cells, while `index.js` submits game-view overlay sprites after world content. Health bars use a small game-layer system plus renderer helpers and an animation frame loop. Player health changes currently flow through `player-lifecycle.js`; enemy and spawner damage flow through entity systems that call `onDamage`.

The UI stylesheet entrypoint imports feature-owned CSS files from `ui-layer-react/styles.css`. The requested `floating-text.css` style ownership should exist without moving gameplay or renderer ownership into React.

## Goals / Non-Goals

**Goals:**

- Add a reusable game-layer floating text event model for signed health deltas.
- Capture visible player damage, visible player healing, and visible health deltas for current or future health-bearing entities.
- Avoid creating floating-text records for offscreen, fogged, inactive-realm, or otherwise non-rendered simulation events.
- Reuse the existing overlay and animation-frame patterns where practical.
- Keep styling ownership separate through `floating-text.css` and `.floating_text...` classes for DOM-facing presentation or fallback affordances.

**Non-Goals:**

- No minimap, map-window, HUD, log, or React rendering of floating text.
- No delayed replay of events that happened while an entity was not rendered.
- No combat rebalance, health-bar redesign, or change to the player's no-health-bar rule.
- No new external animation or rendering dependency.

## Decisions

### Use a game-layer floating text system

Create a small Babylon Lite system that records independent floating text instances with `id`, entity identity or anchor cell, realm, signed value, color role, creation time, and lifetime data. It should expose `recordDelta(...)`, `getVisible(...)`, `hasActive(...)`, `remove/clear` style methods, mirroring the health-bar system shape where it helps.

Alternative considered: compute text directly inside each damage/heal call site. That would duplicate lifetime and visibility behavior and make future health-bearing entities harder to support.

### Gate creation before allocating records

The call site that knows a health delta occurred should first determine the actual applied delta, then ask whether the affected entity is currently rendered in the active game world view. Only visible active-realm, discovered, in-region entities create floating-text records. Offscreen tick simulation returns after gameplay state changes with no presentation allocation.

Alternative considered: record every event and filter during render. That preserves more event history but violates the performance requirement for offscreen tick simulation and can create delayed text without a visible cause.

### Centralize applied player health deltas

Player damage and healing should capture the previous and next health values around `playerLifecycle.applyHealthDelta(...)`, then use `next - previous` as the actual displayed delta. This keeps clamp behavior honest for healing and lethal damage. Object effects such as Heart and Trap and enemy damage should use the same helper so player delta text is consistent.

Alternative considered: display the requested delta at each call site. That is simpler but can show `+10` when only `+2` health was actually restored.

### Treat entity damage callbacks as health delta producers

Enemy and spawner damage callbacks already receive previous and current health for health bars. Floating text can use the same applied delta, but unlike health bars it should remain generic for all health entities. The implementation should avoid coupling floating text to the health-bar restriction that excludes the player.

Alternative considered: extend the health-bar system to show text. That would mix two different presentation lifecycles and conflict with the player's deliberate no-health-bar rule.

### Render as a game-view overlay with renderer-owned resources

Use a dedicated floating-text renderer/helper for geometry, color roles, alpha, and upward motion. It should render after world content in the game view, near the health-bar overlay order, and dispose resources with the game layer. If the renderer uses sprite/text atlas resources rather than DOM nodes, CSS remains the style ownership for DOM-backed wrappers, fallback, or debug surfaces while renderer constants own the actual in-canvas colors and timing.

Alternative considered: render DOM elements over the canvas. That would make CSS simpler but risks desynchronizing from grid geometry and undermines Babylon Lite ownership.

## Risks / Trade-offs

- **Text rendering may require atlas or glyph raster work** -> Keep the renderer helper focused and add tests that verify timing, geometry, and integration fragments rather than overhauling the renderer.
- **Visibility checks may drift from world rendering** -> Reuse the same visible region, active realm, and discovery checks used by existing game-view overlays.
- **Multiple same-anchor texts may overlap** -> This is intentional for the first version; every instance starts at the same top-edge anchor and drifts independently.
- **CSS may not control the actual canvas text color** -> Preserve the requested separate stylesheet/class ownership for DOM-facing presentation, and document renderer constants as the game-view drawing source when text is canvas/sprite based.
