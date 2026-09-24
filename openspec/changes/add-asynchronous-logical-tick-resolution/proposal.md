# Proposal

## Why

World-time ticks currently dispatch every registered system synchronously from the input-triggering call stack. A single movement or attack can therefore concentrate enemy, NPC, spawner, stamina, combat, and presentation-related work on one render frame, making input feel less responsive even though the logical time advance itself is small.

The game needs to preserve deterministic logical time while allowing the work caused by one tick to resolve over multiple render frames. A time tick is not a render frame: it is triggered on one frame, continues through later frame opportunities, and must not block rendering while it is being resolved.

## What Changes

- Introduce an asynchronous logical-tick lifecycle in the Babylon Lite game layer.
- Commit a tick identity and cause immediately when movement or another time-consuming action advances world time.
- Deliver one immutable tick event to every eligible tickable system exactly once while allowing each system's work to yield and resume across later render frames.
- Keep Babylon Lite authoritative for tick registration, simulation, entity state, combat, occupancy, and rendering invalidation; React continues to receive only approved snapshots.
- Keep the render loop independent from tick completion so the game can continue rendering, animating, and accepting input while prior tick work is pending.
- Preserve deterministic seeded behavior, entity birth/age semantics, registration order where required, and the existing movement/combat time-advance rules.
- Define behavior for overlapping logical ticks, stale or cancelled work, entity removal, realm changes, disposal, hidden documents, and deferred failures.
- Add focused instrumentation and tests proving logical tick order separately from render-frame scheduling and proving that a tick can span multiple frames.

## Capabilities

### New Capabilities

- `asynchronous-logical-ticks`: Defines the lifecycle, scheduling, ordering, cancellation, and completion semantics for logical world-time ticks that resolve across render frames.

### Modified Capabilities

- `time-system`: World-time advances continue to broadcast deterministic ticks, but delivery becomes resumable across render frames while preserving exactly-once logical delivery.
- `game-layer-architecture`: Babylon Lite remains the authoritative simulation owner while simulation work and rendering are explicitly decoupled during pending tick resolution.

## Impact

- Affected source areas include `systems/time-system.js`, the existing deferred-work scheduler, game-layer orchestration in `index.js`, tick-driven enemy/NPC/spawner/stamina/combat systems, visual invalidation, and the narrow bridge snapshots.
- Affected tests include the time-system suite, tick-driven system suites, deferred scheduler tests, and integration-level game-layer tests that exercise movement and combat.
- No new dependency, worker, renderer replacement, or React-owned simulation state is planned.
- Validation will use focused Node tests, the existing full test/build commands, and manual browser verification with explicit fixed seeds. No Playwright test files are required by this proposal.
