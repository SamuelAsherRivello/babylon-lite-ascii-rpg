# Tasks

## 1. Camera Resize Calculation

- [x] 1.1 Capture the player’s current screen-cell offset before replacing the viewport and add a resize-specific camera resolution path that uses the active camera mode; verify center, deadzone, and lock calculations remain bounded for changed viewport dimensions.
- [x] 1.2 Update the game-layer resize transaction to recalculate the camera after effective canvas, orientation, or observed layout changes while safely deferring origin resolution when no world/player exists; verify duplicate-size notifications remain ignored.
- [x] 1.3 Ensure the resized world render rebuilds viewport-dependent renderer capacity and reconciles every visible cell, including undiscovered cells, before the minimap is refreshed; verify no stale glyphs remain after a visible-region change.

## 2. Focused Regression Coverage

- [x] 2.1 Add pure camera/view-origin tests for landscape-to-portrait changes in center, deadzone, and lock modes, including world-boundary clamping and preserved player world position; verify the focused test command passes.
- [x] 2.2 Add game-layer source or integration coverage for resize-before-world initialization and effective-size guarding, following the existing Node test strategy without adding Playwright files; verify the relevant Node tests pass.

## 3. Validation

- [x] 3.1 Run the complete existing Node test suite from the repository’s application root and verify it passes without modifying unrelated dirty work.
- [x] 3.2 Run the production build and verify it succeeds.
- [x] 3.3 Manually verify the running game across landscape and portrait browser resizes in each camera mode, confirming the player/world composition updates immediately and no stale cells remain.
