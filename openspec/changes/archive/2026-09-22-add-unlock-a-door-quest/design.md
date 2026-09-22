# Design

## Context

See `proposal.md` and the questing-system delta for the requested behavior.
The game already loads ordered quest definitions from JSON, evaluates generic
realm and pickup events, publishes immutable snapshots through the bridge, and
uses the same snapshot for the HUD and Gameplay Settings. Underground key and
door behavior is owned by the game layer and must remain outside React.

## Goals / Non-Goals

**Goals:**

- Represent the new quest entirely through the existing definition and quest
  manager contracts.
- Reuse generic `realm-entered`, `pickup-collected`, and door-unlocked events
  so producers do not depend on quest code.
- Ensure a quest started in Underground can resolve its initial realm step
  without waiting for a second realm transition.
- Ensure Gameplay Settings derives its quest cards from the complete quest
  definition catalog rather than maintaining a separate registration list.
- Derive one closest reachable target from the active step and pass it through
  the existing minimap navigation-marker path.
- Verify the catalog, event sequencing, HUD snapshot, selector, toast path, and
  client reset without adding dependencies.

**Non-Goals:**

- Generating a new key or changing key placement, door collision, door glyphs,
  or unlock logs.
- Persisting quest progress or adding unique key identity tracking.
- Adding a second quest UI or changing the existing quest-selection model.

## Decisions

1. **Append the definition after `Collect Gold`.** The existing manager advances
   through definitions in order, so appending preserves the current quest while
   making the new quest the next available objective. A separate quest list or
   reordering would change established progression for no user benefit.

2. **Use event criteria for all three steps.** `Enter Underground Realm` uses
   `realm-entered` with `realm: Underground`; `Collect Key 1 of 1` uses
   `pickup-collected` with `pickupType: key`; and `Open a door` uses the generic
   `door-unlocked` event. This keeps the quest independent of coordinates,
   object identity, and mutable world state. The key step deliberately omits a
   pickup request so it observes the existing Underground key.

3. **Resolve the initial realm through the existing bootstrap state boundary.**
   When the selected quest starts, the game layer will make the current realm
   available to the quest manager using the same generic realm-entry contract
   already used for initial realm observation. This avoids a UI-side special
   case and ensures an Underground start immediately exposes key collection.

4. **Keep presentation data-driven.** No new HUD component or bridge field is
   needed. The existing ordered `steps`, `activeStepId`, progress, lifecycle
   state, and completion fields drive the quest title, task lines, selector
   card, and toasts. Gameplay Settings will map the full `quest_data.json`
   catalog, so every current and future quest definition appears in the
   `Quests` tab without a second registration surface.

5. **Use the active step's navigation identity.** Quest definitions declare
   `nearest-stairs`, `nearest-key`, or `nearest-door`; the game layer resolves
   the closest reachable target from authoritative realm objects and the
   minimap renders one navigation marker. The UI does not inspect coordinates.

## Risks / Trade-offs

- [Risk] The door system may not yet publish the exact generic unlock event
  needed by the quest. → Confirm the event name and payload at the existing
  game-event boundary before implementation; add only the producer-side event
  publication if required, without moving quest logic into the door system.
- [Risk] A quest started after an initial realm event could miss that event. →
  Start the quest and reconcile the current realm through the bootstrap
  boundary before exposing the first snapshot; cover both Overground and
  Underground starts in focused tests.
- [Risk] Appending the quest changes the automatic post-completion sequence. →
  Preserve the existing definition-order rule and explicitly test that
  Collect Gold still completes and then advances to `Unlock A Door`.

## Migration Plan

Add the catalog definition and focused contract tests, then run the existing
Node suite and production build. No data migration is required; existing saved
Default Quest IDs remain valid, and the new quest is selected only when chosen
or reached by normal ordered advancement.
