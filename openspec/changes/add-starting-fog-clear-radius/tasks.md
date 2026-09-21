# Tasks

## 1. Starting footprint calculation

- [x] 1.1 Add a fog-system starting-reveal operation that accepts independent
  X/Y footprint dimensions, uses the existing visibility and clear-path
  bookkeeping, and verifies bounded iteration with focused fog tests
- [x] 1.2 Add realm-profile starting-clear configuration for Overground `95%`
  and Underground `60%`, and verify the profiles preserve their existing
  movement `fogUnclearRadius` values
- [x] 1.3 Resolve the logical viewport columns and rows at displayed zoom `5`
  through the existing viewport/grid sizing path, convert each realm's
  percentage into a centered player-start footprint, and verify separate-axis
  rounding and world-edge clamping

## 2. Game initialization integration

- [x] 2.1 Invoke the starting reveal after the active realm and player-start
  cell are established, and verify it runs before the first movement input
- [x] 2.2 Preserve per-realm fog ownership during initialization and realm
  transfer, and verify revealing one realm does not mutate the other realm's
  fog record
- [x] 2.3 Verify normal movement discovery remains additive after the starting
  reveal, including existing line-of-sight, stepped visibility, and
  maximum-ever persistence behavior

## 3. Regression verification

- [x] 3.1 Extend focused fog, world, and rendering tests for Overground `95%`,
  Underground `60%`, independent X/Y extents, clamping, minimap visibility,
  and inactive-realm isolation
- [ ] 3.2 Run the repository's documented Node test suite and build command,
  then manually inspect a fresh Overground and Underground browser start at
  the verified project URL to confirm the initial fog presentation
