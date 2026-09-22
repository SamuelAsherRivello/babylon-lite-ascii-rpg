# Tasks

## 1. Cooperative World-View Renderer

- [x] 1.1 Add an opt-in cooperative world-view render helper beside the synchronous helper and verify existing synchronous world-view tests still pass unchanged
- [x] 1.2 Implement row-major/budgeted batching with injectable frame scheduling and verify a focused test observes yielding before all cells are drawn
- [x] 1.3 Implement cooperative cancellation and verify a focused test proves cancelled jobs do not draw later cells or overlays
- [x] 1.4 Verify cooperative completion draws background, cells, and overlay in the same final order and counts as the synchronous renderer for the same composition

## 2. Map-Window Adoption

- [x] 2.1 Route only `renderMapview` through the cooperative renderer and verify game-view and minimap call sites still use the synchronous path
- [x] 2.2 Add map-window render job ownership/cancellation for open, close, realm toggle, resize, and disposal paths and verify stale jobs cannot draw after replacement
- [x] 2.3 Preserve diagnostic map behavior and verify fog bypass, lighting factor `1`, full-realm fit, and marker overlay behavior remain unchanged
- [x] 2.4 Verify map-window glyph caches and canvas backing resources are cleared on close even when a cooperative render is pending

## 3. Validation

- [x] 3.1 Add or update focused Node client tests for cooperative rendering, cancellation, and map-window integration, then run `npm.cmd test`
- [x] 3.2 Run `npm.cmd run build` and verify the production build succeeds
- [x] 3.3 Run `openspec validate world-view-async --strict` and verify the change is valid
- [x] 3.4 Manually open the map view in the browser, toggle realms during an in-progress render, close during an in-progress render, and verify the UI remains responsive with no stale realm content or markers
