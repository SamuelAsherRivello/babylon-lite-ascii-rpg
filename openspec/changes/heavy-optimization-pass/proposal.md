# Proposal

## Why

Recent world-generation features introduced repeated map scans, expensive building candidate searches, synchronous NPC route planning, and work performed before cache reuse can be decided. Players need a complete, responsive world with every production layer enabled; improving readiness must also avoid moving the same stall into the next frame.

## What Changes

- Analyze and measure all 16 registered generation features and their internal stages, beginning with a High-size diagnostic baseline with optional layers off, then isolated and cumulative layer enablement in both realms.
- Optimize repeated terrain, connectivity, water, object, civilization, and spawner work while preserving valid seeded layouts, placement rules, visual quality, and gameplay behavior. Prioritize measured costs; the existing code review is a hypothesis, not a timing result.
- Make the normal production baseline Med world size (256 x 256 per realm), all applicable layers enabled, and Med density defaults. Restrict disabling to development/debugging; retain valid explicit size and density selections.
- Improve generation-preview and world-view cache reuse so unchanged inputs avoid generation/composition/drawing and local changes do bounded work. Preserve existing full-refresh fallbacks and resource limits.
- Separate initial placement and collision readiness from deferred nonvisual work. Present NPCs at their final initial cells before choosing their exact patrol routes after a browser presentation opportunity; preserve spawn eligibility, logical-time behavior, seeded randomness, and cancellation safety.
- Audit secondary-realm preparation, navigation indexes, discovery metrics, and hidden-view preparation for similar deferral. Work required for visible content, initial fog/lighting, occupancy, collisions, or paired stairs remains a readiness prerequisite.
- Measure terrain-ready, complete visible placement, input-ready, deferred completion, and warm refresh independently. Target roughly 100 ms for Low, 500 ms for Med, and 1000 ms for High generation-to-complete-view; prioritize 100-500 ms or faster for Med/all-enabled/Med-density game-view refresh. These are improvement goals, not hard limits or a new 2-10 FPS rendering cadence.

## Capabilities

### New Capabilities

- `deferred-world-initialization`: Safely schedules nonvisual initialization after initial presentation without changing placement, simulation results, or lifecycle ownership.

### Modified Capabilities

- `world-generation-passes`: Bounded, deterministic layer execution with effective zero-work disabled/zero-count diagnostics and reusable generation data.
- `world-view-caching`: Semantic generation-preview reuse and bounded partial composition before expensive view preparation.
- `procedural-generation-settings`: Production all-enabled behavior and consistent Med defaults while retaining development isolation controls.
- `performance-monitoring`: Per-layer timings and honest complete-view/deferred readiness measurements with comparable cold and warm scenarios.

## Impact

- Source areas: world generation/profile/registry/settings, world/objects/buildings/civilization/spawners, NPC initialization, navigation utilities, game-layer orchestration, shared views/caches, lighting/fog integration, and performance monitoring under `ascii-rpg/src/client/`.
- Validation: meaningful Node regressions, production build, manual fixed-seed browser comparisons, and a per-layer before/after evidence report. No new package, hosting change, or renderer replacement is planned.
- Coordinate with `refactor-high-traffic-code-boundaries`, `add-overworld-buildings`, `add-overworld-npc-patrols`, `fix-game-lockups`, and `add-performance-monitoring-system`; do not absorb their unrelated unfinished work.
- Acceptance requires unchanged enabled content/placement contracts, bounded/cancellable deferred jobs, truthful readiness, and documented performance improvements or explicit remaining target gaps. No numerical result is claimed by this proposal.
- Remaining empirical choices: exact slice budgets, partial-refresh thresholds, and which optional nonvisual candidates are profitable to defer will be selected from baseline measurements. Workers and changes to seeded generation algorithms are outside this plan unless separately justified and approved.
