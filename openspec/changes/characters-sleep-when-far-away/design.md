# Design

## Context

See `proposal.md` for the motivation. The player-driven time system snapshots all registered tickables and, when cooperative scheduling is enabled, queues a deferred job for each one. Enemy and ambient-NPC systems register each actor separately, so out-of-realm actors still create delivery and scheduler work before their own simulation determines that it cannot affect the player.

## Goals / Non-Goals

**Goals:**

- Eliminate deferred tick jobs and expensive character simulation for enemies and ambient NPCs that cannot currently interact with the player.
- Preserve deterministic ordering for every eligible entity and the existing player-driven world-time source.
- Preserve immediate, frame-based recruited-party following and visible-region rendering behavior.

**Non-Goals:**

- No autonomous timers, catch-up simulation, actor despawning, background realm simulation, artificial population cap, configurable sleep radius, or renderer rewrite.

## Decisions

### Gate delivery before scheduler enqueue

Extend tick registration/delivery with a character eligibility predicate that is evaluated while forming the delivery snapshot. Ineligible actors remain registered but are omitted before any deferred job is created. This is selected over an early return inside `simulate()` because the latter still allocates and queues a job per sleeping actor, which is the avoidable cost in the current cooperative path. It is selected over unregistering actors because register/unregister churn complicates lifecycle order and can lose the instant wake-up condition.

### Use a fixed cardinal radius of 50 cells

An actor is active only when its realm equals the living player's realm and `abs(dx) + abs(dy) <= 50`. This uses integer subtraction, absolute values, addition, and one comparison—no pathfinding, square roots, or octile floating-point work. It matches existing cardinal actor routes and the project's established cardinal gridspot terminology. Path distance is rejected because it would require the navigation work this optimization is meant to avoid.

### Preserve global time and do not replay skipped behavior

World time continues to advance for successful player actions, and sleeping actors retain their birth time and occupancy. Their next eligible delivery uses the current committed time and runs normally at most once; it does not replay missed patrol steps, attacks, or path searches. This retains the established age-based enemy action cadence without processing inactive intermediate ticks.

### Separate ambient tick sleep from party following

Only ambient NPC patrol simulation is sleep-gated. Recruited NPCs continue through the existing render-frame follow update so a party member remains responsive and transitions with the player. This avoids mixing a visual/frame responsiveness contract into the world-time scheduler.

### Keep rendering as its existing, independent culling concern

The change does not add per-character render registration or a second render gate. Sleeping characters already cannot be in the active camera realm, and the renderer's established visible-region culling remains authoritative. This avoids stale sprites and keeps simulation eligibility separate from presentation eligibility.

## Risks / Trade-offs

- Boundary movement can alternate an actor between active and sleeping → use an inclusive fixed threshold and verify both 50- and 51-cell cases.
- Predicate evaluation still scans registered tickables → keep it constant-time and verify scheduler job counts fall with inactive populations.
- Global age can advance while an enemy sleeps → retain the existing age formula but enforce no catch-up delivery; test wake-up on both action and non-action time values.
- Recruited NPCs share NPC registration with ambient patrols → explicitly exclude recruited NPCs from the ambient sleep gate and regression-test frame-based following.

## Migration Plan

No persisted state or data migration is needed. Deliver the eligibility-aware coordinator and system predicates with focused Node tests, then run the normal Node suite, production build, strict OpenSpec validation, and a manual, fixed-seed browser check that crosses the 50/51 boundary in both realms.
