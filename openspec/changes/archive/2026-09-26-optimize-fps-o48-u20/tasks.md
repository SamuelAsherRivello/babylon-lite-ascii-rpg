# Tasks

## 1. Investigation and core optimization

- [x] 1.1 Independently ablate all optional procedural layers with a fixed seed and inspect frame timings and pending callbacks in both realms.
- [x] 1.2 Prevent continuous-input queue starvation and verify the continuous-enqueue regression test.
- [x] 1.3 Reduce hierarchical search allocations and reuse revision-valid enemy routes; verify focused pathfinding and enemy-system tests.
- [x] 1.4 Stabilize torch snapshots and equivalent minimap rasters with explicit lighting invalidation; verify lighting and object-spawner tests.

## 2. Trustworthy measurement

- [x] 2.1 Complete opt-in keyboard-path sprint reporting with one-second FPS and movement validity; verify sample acceptance and rejection with Node tests.
- [x] 2.2 Verify thirty-second all-enabled Med-density sprinting in both realms for two fixed seeds, with every complete one-second Overground sample at least 48 FPS, every complete one-second Underground sample at least 20 FPS, and no accumulating simulation lag.

## 3. Delivery checks

- [x] 3.1 Run the full Node suite, production build, and strict OpenSpec validation successfully.
- [x] 3.2 Deliver a performance evidence report covering ablations, bottlenecks, final environment and results, limitations, and a reproducible local play URL.

## Verification record

The report is `ascii-rpg/documentation/performance/medium-world-sprinting.md`.
On 2026-09-26, the user confirmed that the all-enabled Med-density sprint runs
met the realm-specific acceptance criteria in this change. Existing full-suite,
production-build, and strict OpenSpec validation evidence remains applicable.
Do not revert unrelated edits.
