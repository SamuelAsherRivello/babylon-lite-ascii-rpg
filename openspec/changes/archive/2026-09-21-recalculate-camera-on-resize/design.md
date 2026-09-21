# Design

## Context

The game layer derives a logical viewport from the canvas dimensions and
currently calls `rebuildViewport()` from its resize handler. Camera behavior is
implemented through shared view-origin helpers for center, deadzone, and lock
modes, while the render path already rebuilds the visible world and minimap.
The design must preserve those existing camera modes and avoid introducing a
second camera state or a new dependency.

## Goals / Non-Goals

**Goals:**

- Make effective canvas dimension changes recalculate the active camera origin
  against the new viewport.
- Preserve the player’s world cell and apply each mode’s existing boundary
  rules and screen-placement intent.
- Keep resize handling safe during generation and deterministic for repeated
  resize/orientation notifications.
- Add focused regression coverage for the pure view calculation and resize
  integration path.

**Non-Goals:**

- Changing the camera mode labels, persistence, zoom levels, or deadzone ratio.
- Changing world generation, movement, fog discovery, minimap scale, or UI
  layout behavior beyond what is necessary to display the recalculated view.
- Adding a Babylon camera abstraction or an external resize/layout library.

## Decisions

1. **Reuse the existing viewport and view-origin helpers.** After creating the
   new viewport, the resize path will resolve the origin through the same mode
   dispatcher used by movement and zoom. This keeps center, deadzone, lock,
   clamping, and world-size behavior in one source of truth. A separate
   resize-only formula was rejected because it could drift from movement and
   zoom semantics.

2. **Preserve screen-relative placement when resize semantics require it.**
   The resize operation should capture the player’s prior screen-cell offset
   before replacing the viewport, then use the existing preserved-position
   calculation where that is compatible with the active mode. Center and
   deadzone modes must still satisfy their new viewport rules; lock mode should
   retain the prior placement whenever the new dimensions and world bounds
   allow it. Blindly recentering on every resize was rejected because it causes
   visible camera jumps, especially for lock mode.

3. **Treat a resize as one viewport/render transaction.** The handler will
   update the viewport, recalculate or clamp the origin, rebuild any renderer
   capacity that depends on viewport size, and render the world/minimap from
   that single state. Existing effective-size guards remain responsible for
   ignoring duplicate notifications and preventing resize-observer feedback.

4. **Keep pre-world resize behavior guarded.** When no world or player cell is
   available, resize will update the viewport and defer camera-origin
   calculation until initialization completes. Attempting to resolve a camera
   against incomplete generation state was rejected because it adds race-prone
   special cases to the camera helpers.

## Risks / Trade-offs

- [Risk] Rapid browser resize events may trigger repeated expensive world
  renders. → Mitigation: retain the existing effective canvas-size guard and
  reuse the current render scheduling/observer behavior.
- [Risk] A narrower viewport can expose different world boundaries and make a
  previous screen placement impossible. → Mitigation: clamp through the shared
  world-boundary logic and prioritize valid world visibility over exact screen
  placement.
- [Risk] Resize notifications can arrive during generation. → Mitigation: keep
  the no-world guard and let completed initialization apply the current
  viewport before its first playable render.

## Migration Plan

No data migration is required. The change is runtime-only and compatible with
existing saved camera-mode preferences. Validate with the existing Node tests,
production build, and manual browser checks across landscape and portrait
resizes. Rollback consists of reverting the implementation commit; no stored
state needs cleanup.
