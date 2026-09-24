# Design

## Context

See proposal.md and the `asynchronous-logical-ticks` delta for the motivation and behavioral contract. The current time system increments its counter and invokes all registered tickables synchronously. The game already has a game-owned deferred scheduler that runs bounded resumable jobs on requestAnimationFrame opportunities, while Babylon Lite owns simulation and React consumes narrow snapshots.

## Goals / Non-Goals

**Goals:**

- Separate logical time from render-frame timing.
- Make a committed tick resumable, bounded, observable, and cancellable.
- Preserve deterministic tick identity, registration semantics, entity ages, seeded decisions, and game-layer ownership.
- Keep rendering and input responsive while tick work is pending.
- Provide explicit lifecycle and ordering contracts for overlapping ticks.

**Non-Goals:**

- Moving simulation into Web Workers or adding a new concurrency dependency.
- Making every system parallel or allowing arbitrary races between ticks.
- Changing movement cadence, combat rules, enemy/NPC intervals, or seeded generation behavior.
- Letting React schedule, inspect, or resolve gameplay work.
- Treating requestAnimationFrame as a logical clock or promising physical display completion.

## Decisions

### 1. Use a logical tick record plus resumable system jobs

When time advances, create one immutable tick record containing the time, cause, trigger-time delta in milliseconds, session revision, and ordering metadata. Snapshot the eligible registration order once and announce ticks in ascending logical-time order. Each system receives `tick(currentTimeInTUnits, deltaTimeInMilliseconds)`; the system does not inspect queues or determine whether delivery is in order. A job may yield and resume, but it cannot create another delivery for the same tick.

The existing deferred scheduler is the preferred execution mechanism because it already supports frame-bounded slices, fairness, cancellation, visibility suspension, and completion states. Extend it or add a tick-specific coordinator above it rather than introducing a second general scheduler.

Alternative rejected: wrapping the existing synchronous dispatch in a promise. A promise alone does not yield expensive work or guarantee that rendering gets a meaningful opportunity between slices.

### 2. Commit time separately from resolving tick work

The time counter and UI-facing time notification are committed when the action triggers the tick. The coordinator captures real elapsed time at that trigger. For a multi-unit advance, the first announced tick receives the elapsed interval and later ticks in that batch receive zero; the initial/session-start tick receives zero. Completion of enemy, NPC, stamina, and other work is tracked separately. The renderer may continue normally while the tick is pending.

This avoids confusing logical time with frame count and prevents the UI from waiting for simulation completion merely to display the new time. If a gameplay action depends on prior work, it uses an explicit pending dependency rather than blocking the render loop.

### 3. Preserve coordinator-owned ordering

The coordinator owns logical tick ordering and invokes each system with ordered tick calls. Systems remain dumb consumers of the callback contract and do not inspect, compare, queue, or repair ordering. Any required cross-system dependency remains coordinator-owned; independent presentation invalidation can be coalesced after authoritative state changes.

The initial implementation should serialize only where required for correctness, not serialize the entire render loop or assume that all systems must finish before another frame renders. Overlapping logical ticks are retained as records; dependent work cannot overtake its prerequisite.

Alternative rejected: requiring systems to detect or repair out-of-order ticks themselves. That duplicates scheduler policy inside gameplay systems and makes deterministic behavior dependent on every system implementing the same queue logic.

### 4. Guard every deferred result with lifecycle identity

Each job checks session, world/realm, entity, and relevant terrain revisions before applying a result. Restart, disposal, removal, and incompatible world replacement cancel or invalidate pending jobs. Errors settle the affected job and are surfaced through existing local diagnostics without leaving an undrainable queue.

### 5. Keep presentation decoupled from simulation

Tick-driven simulation continues for entities outside the active realm or visible region. Presentation work is invalidated/coalesced separately and only submits applicable active-view content. A pending tick must not create duplicate actors, duplicate subscriptions, stale floating text, or stale health-bar updates.

## Risks / Trade-offs

- [Ordering ambiguity] Splitting a formerly synchronous dispatch can expose hidden dependencies -> inventory tickables and add focused order/overlap tests before enabling asynchronous execution per system.
- [State races] A later tick may observe an incomplete earlier mutation -> use explicit per-system prerequisites and reject unsafe overtaking rather than relying on render-frame timing.
- [Visual lag] Simulation may commit before its visible consequences are ready -> retain normal rendering every frame and coalesce invalidations; measure tick-to-visible-update latency separately from FPS.
- [Unbounded jobs] Deferring a monolithic system still causes a later frame stall -> require each expensive job to yield internally and report longest slice duration.
- [Hidden-document backlog] Suspended rendering can leave pending work -> pause safely, cancel obsolete jobs, and resume current work without replaying ticks or generating catch-up bursts.

## Migration Plan

First add coordinator and focused time-system tests behind the existing synchronous-compatible contracts. Adapt one bounded tick-driven system at a time, preserving a deterministic fallback for fixtures while comparing results. Integrate lifecycle cancellation and presentation invalidation, then run full tests/build and fixed-seed browser verification with instrumentation. Rollback is additive: retain the prior synchronous dispatch path behind an internal compatibility mode until asynchronous ordering and parity checks pass.

## Open Questions

- Which tick-system groups can safely overlap after dependency inventory is complete?
- What initial per-slice budget best preserves desktop and coarse-pointer mobile responsiveness?
- Should the bridge expose a separate diagnostic-only “pending tick work” metric, or keep that state entirely internal?
