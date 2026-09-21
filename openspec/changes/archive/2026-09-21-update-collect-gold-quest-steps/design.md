# Design

## Context

The Babylon Lite game layer currently owns active realm state and transitions
inside its game controller. The Object Spawner System already publishes generic
collision events through subscriptions, while the Quest System currently
observes only those pickup events. The React layer receives immutable quest
snapshots through the existing bridge and must remain unaware of world cells,
realm internals, and pickup coordinates. See `proposal.md` and the questing and
world-realms spec deltas for the required behavior.

## Goals / Non-Goals

**Goals:**

- Represent ordered quest steps and advance the active step only from matching
  generic gameplay events.
- Make initial realm establishment and later realm transfers observable through
  the same event contract.
- Delay quest-gold placement until the Overground prerequisite is satisfied.
- Preserve the existing UI/game-layer boundary, runtime-only state, and generic
  Object Spawner ownership of pickup effects and pickup events.

**Non-Goals:**

- Do not add quest checks, quest IDs, or quest progression calls to realm or
  object-spawner code.
- Do not make React inspect the active realm beyond its existing status snapshot.
- Do not persist quest steps, collected gold pickups, or realm-entry history.
- Do not redesign realm generation, stair pairing, pickup effects, or event
  payloads unrelated to this quest.

## Decisions

### Use one generic gameplay event stream

Introduce or reuse a narrow game-layer event stream with `publish` and
`subscribe` operations. The realm boundary publishes `{ type: "realm-entered",
realm }`; the Object Spawner System publishes its existing pickup collision
events, including `{ type: "pickup-collected", pickupType: "gold" }`. The Quest
System subscribes once and receives every event, filtering by the active step's
criterion.

This keeps producers factual and reusable. Adding quest callbacks directly to
the realm or object-spawner systems was rejected because it would invert
ownership and make every future quest a producer concern. Keeping separate
subscriptions in the game controller was also rejected because the controller
would become a quest-aware event router.

### Publish the initial realm after quest subscription

During startup, construct the generic event stream, construct and subscribe the
Quest System, start the Collect Gold quest, then publish the initial active
realm as a normal `realm-entered` event. Realm transitions publish the same event
after the destination realm becomes active. This means the quest never needs to
read realm state to decide whether its first step is complete, and an
Overground start follows exactly the same event path as a later Overground
arrival.

### Model quest progress as an ordered active step

Quest definitions declare ordered steps. The manager stores completed steps and
one active step, evaluates only that step's event criterion, and activates the
next step when the current one completes. The relative gold baseline is captured
when the gold step activates, not when the quest starts. The pickup request is
triggered by the gold step activation, so an Underground start cannot place
quest gold in Underground.

### Keep the bridge snapshot immutable and presentation-oriented

The game layer maps quest state to a frozen snapshot containing ordered step
labels, active/completed state, current progress, target, and overall lifecycle.
React renders this snapshot as two ordered HUD lines and continues to use the
existing quest lifecycle toast subscription. The bridge will not expose event
subscriptions, world objects, coordinates, or mutable manager state.

### Treat event ordering as synchronous within one gameplay action

A realm activation publishes its event after the destination realm is selected;
the Quest System may synchronously request gold as a consequence. Object
creation remains owned by the Object Spawner System, and pickup collection
continues to emit after its one-time effect is applied. This preserves the
current collision semantics while making step activation deterministic.

## Risks / Trade-offs

- [Risk] A producer could publish an event before the Quest System subscribes during startup. -> Construct the event stream and quest subscription before publishing the initial realm event; add an integration test for both initial realms.
- [Risk] Gold could be requested more than once if a realm event is repeated. -> Make step activation idempotent and associate the pickup request with one transition into the gold step; test repeated Overground events.
- [Risk] Existing UI/tests assume a single `objective/current/target` shape. -> Preserve top-level quest identity and lifecycle fields where compatible, add ordered steps explicitly, and update focused bridge/HUD tests together.
- [Risk] Realm-entry events could expose internal transition timing. -> Publish only after the destination active realm is authoritative and include only the realm identifier in the generic event.

## Migration Plan

1. Update the quest and realm delta contracts and focused unit/integration tests.
2. Implement the generic event stream and migrate the existing Object Spawner event publication to it.
3. Publish initial and transitioned realm-entry events, then update Quest System step activation and gold-request timing.
4. Update the immutable bridge snapshot and React HUD/toast rendering.
5. Run the repository's existing Node test suite and build checks, then manually verify both initial-realm paths and a complete quest in the running browser.

Rollback is a source change rollback: restore the prior single-step quest snapshot,
immediate gold request, and existing pickup-only subscription. No persisted data
or migration is required.
