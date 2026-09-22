# Tasks

## 1. Floating Text Model

- [x] 1.1 Add a Babylon Lite floating text system for independent signed health-delta records and verify focused unit tests cover fade-in, hold, fade-out, upward motion progress, separate rapid instances, expiration, and clear/remove behavior.
- [x] 1.2 Add floating text geometry/color helpers and verify focused unit tests cover top-edge anchoring, 10% grid-width upward travel, red damage text, green healing text, signed formatting, and clamped-delta display inputs.

## 2. Health Delta Producers

- [x] 2.1 Centralize player health delta capture around `playerLifecycle.applyHealthDelta(...)` and verify player lifecycle or integration tests show actual applied deltas after damage, healing, and health clamping.
- [x] 2.2 Emit visible player floating text from enemy damage, trap damage, and Heart healing paths and verify focused tests cover red negative player text and green positive player text.
- [x] 2.3 Emit visible entity floating text from enemy and spawner damage callbacks without coupling to health-bar restrictions and verify tests cover damage text for visible non-player health entities.

## 3. Render Gating And Overlay Integration

- [x] 3.1 Add render-gated creation checks using active realm, current visible region, and discovery/render visibility, and verify tests show offscreen, fogged, and inactive-realm health changes create no floating text records.
- [x] 3.2 Integrate floating text rendering into the game-view overlay pass and animation-frame loop, and verify tests or source-contract checks cover creation, update, hide/dispose, active animation scheduling, and game-layer cleanup.
- [x] 3.3 Verify floating text remains game-view-only by covering that minimap, map window, Character HUD, log, and React bridge paths receive no floating-text records or rendering responsibility.

## 4. Style Ownership

- [x] 4.1 Add `floating-text.css` with a `.floating_text...` class namespace for DOM-backed wrapper, fallback, or debug affordance styling and verify it is imported through the existing stylesheet entrypoint without moving gameplay ownership into React.

## 5. Verification

- [x] 5.1 Run the focused floating-text, health-delta, and overlay tests and resolve regressions.
- [x] 5.2 Run the repository Node test suite with `npm.cmd test` and resolve any floating-text, health-bar, combat, object consequence, world-view, or architecture regressions.
- [x] 5.3 Run `openspec validate add-floating-text --strict` and resolve any proposal, spec, design, or task validation issues.
