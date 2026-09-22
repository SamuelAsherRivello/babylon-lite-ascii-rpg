# Design

## Context

The existing player-grid module already separates camera-origin calculation
from world-cell movement. The client currently has both startup origin
resolution and ordinary mode-specific origin resolution, but startup behavior
can be affected by the ordering of bridge application, viewport setup, and the
first world render. See proposal.md and the camera-modes delta for the
user-visible contract.

## Goals / Non-Goals

**Goals:**

- Establish one deterministic, player-centered origin before the first world
  render for every camera mode.
- Preserve Camera Center following, Camera Deadzone thresholds, and Camera
  Lock edge-wrap behavior after startup.
- Verify initial screen position and one-cell movement for all modes.

**Non-Goals:**

- Changing camera mode labels, persistence, or cycling order.
- Changing generated world dimensions, player start-cell selection, movement
  collision, zoom behavior, or realm-transition behavior.
- Adding a browser automation dependency or Playwright test files.

## Decisions

### Use a dedicated startup-origin path

The player-grid camera boundary will expose a startup-origin calculation that
always uses the existing player-centered origin and clamps it to the world.
The game layer will call it exactly for initial placement before submitting the
first visible world composition. Ordinary movement, resize, zoom, and realm
transitions will continue to use the selected camera mode's existing resolver.

This is preferred over changing the Lock or Deadzone algorithms because those
algorithms encode post-startup behavior and their existing edge/deadzone
semantics are already covered by tests.

### Make first-render ordering authoritative

The first world render will defensively establish the startup origin itself,
so a late or repeated bridge camera-mode application cannot leave a stale
origin visible for one frame. Reapplying the same mode after startup may
re-render the active viewport, but it must not mutate the player's world cell.

### Test the lifecycle at the player-grid boundary

The existing Node test suite will model restart with each camera mode, inspect
the resulting screen cell and world cell, apply one valid movement, and assert
the one-cell delta. This keeps the regression deterministic without adding a
browser automation test under the repository's current test policy.

## Risks / Trade-offs

- [Risk] A world start cell near a boundary cannot be displayed at the exact
  viewport center. -> Mitigation: retain the existing bounded-origin behavior
  and assert the actual world cell is preserved.
- [Risk] A redundant bridge mode application could cause an extra startup
  repaint. -> Mitigation: keep it idempotent and restrict any recentering to
  the active player/view after the world exists.
