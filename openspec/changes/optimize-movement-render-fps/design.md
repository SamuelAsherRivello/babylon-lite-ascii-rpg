# Design

## Context

See proposal.md for the reproduced regression and user-facing target. The current Babylon Lite runtime renders a visible region of about 1,100 cells at the normal viewport. Each movement schedules a complete visible-region render, recalculates the moving player's lighting fields, submits the optional additive GPU light sprites, and schedules a minimap repaint. The current live stress run sampled `60, 60, 41, 41, 30, 30, 26, 26, 33, 33, 59, 59` FPS during rapid Shift movement.

The authoritative lighting and fog algorithms already have focused Node coverage. The optimization must remain inside the game layer, preserve the React-to-game bridge boundary, avoid new dependencies, and use the existing manual browser verification policy rather than adding Playwright tests.

## Goals / Non-Goals

**Goals:**

- Keep the exact lighting factors, terrain line-of-sight, player penumbra bounds, fog visibility values, minimap composition, and GPU glow appearance for equivalent inputs.
- Reduce per-movement CPU and garbage-collection pressure by reusing buffers/state and eliminating duplicate work.
- Ensure only the newest movement state is presented when multiple movement events arrive before an animation frame.
- Measure the result in the live browser with idle and sustained Shift-movement FPS samples, plus visual inspection of lighting, fog, and minimap behavior.

**Non-Goals:**

- Do not weaken lighting radius, falloff, shadow occlusion, penumbra range, fog radius, visibility bands, or GPU glow alpha to reach the target.
- Do not remove the GPU light pass, disable fog/minimap rendering, lower the game resolution, or add a quality setting as a workaround.
- Do not change movement cadence, world generation, terrain data, palette values, or public bridge commands.
- Do not add Playwright test files or make browser automation the primary acceptance check.

## Decisions

### Preserve authoritative output and optimize the presentation boundary

Keep `lighting.js` and `fog-of-war-system.js` as the source of truth for factors, blockers, shadows, visibility, and discovery. Add or refactor only bounded helpers that return the same values. Compare optimized helper output with existing direct calculations in focused tests so performance work cannot silently alter the visual contract.

### Reuse movement-render state

Reuse typed arrays, active-slot markers, and temporary sample storage for GPU light submission instead of allocating a sample object and `Set` for every visible cell on every movement render. Keep the same slot visibility reconciliation so old GPU sprites are hidden exactly when they leave the current eligible sample set.

### Consolidate duplicate moving-light traversal

Where the player field currently performs equivalent bounded path and falloff work for the authoritative and GPU-direct results, share the traversal and write the separate output arrays in one pass. Preserve the distinct shadow inputs: the normal player field remains shadow-aware while the GPU-direct field remains unobstructed and the penumbra remains separately bounded.

### Coalesce world and minimap presentation without dropping state

Keep movement state updates and fog discovery synchronous, but coalesce pending presentation work to the latest player cell. A pending frame SHALL not render obsolete player positions. Minimap cell rasters and stable visual inputs SHALL be reused; marker and newly discovered content updates SHALL still appear on the next permitted presentation frame.

### Verify with the live stress protocol

Use the existing project URL and normal viewport. Record an idle sample, run at least ten seconds of rapid Shift movement through changing directions, record one-second FPS samples, release movement, and record recovery. Inspect the game screenshot before and after in representative torch, blocker, fog, and minimap states. Treat any sample below 55 FPS or any visual regression as a failed optimization.

## Risks / Trade-offs

- [Shared buffers can retain stale slots] -> clear or reconcile every active range and assert old GPU sprites are hidden in focused tests.
- [Coalescing can hide a final movement update] -> preserve the newest player state synchronously and schedule one render from that state; verify no light trail remains at superseded cells.
- [Minimap reuse can leave stale fog or markers] -> invalidate only the affected content keys and verify newly discovered cells and player markers after rapid travel.
- [The browser GPU may vary between runs] -> use the same local browser surface and viewport for before/after runs, require the entire sampled stress sequence to stay at or above 55 FPS, and retain the observed baseline in the change record.

## Migration Plan

1. Implement the reusable-buffer, consolidated traversal, and coalesced presentation changes behind the existing runtime paths.
2. Run the focused lighting, GPU light-pass, fog, world-view, and movement tests, then run the complete Node suite and production build.
3. Repeat the live idle and sustained Shift stress protocol and inspect the visual result.
4. If the target is not met or the visual result changes, revert the optimization edits while retaining the diagnostic evidence; no persisted data migration is required.
