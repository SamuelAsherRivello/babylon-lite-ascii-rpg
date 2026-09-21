# Design

## Context

The quest manager already tracks one active quest and advances through ordered
definitions with `startNextQuest()`. The game layer currently publishes a
replacement snapshot immediately on completion, while the React layer derives
toasts from snapshots. That replacement can hide the completed state before
React can reliably announce both lifecycle messages. See `proposal.md` and the
questing-system delta for the required behavior.

## Goals / Non-Goals

**Goals:**

- Preserve the single-current-quest model and definition-order progression.
- Publish completion and next-start lifecycle events in deterministic order.
- Keep the immutable snapshot bridge as the HUD's only quest-state source.
- Leave the final completed quest active without looping or persisting progress.
- Keep toast sequencing compatible with the existing FIFO notification system.

**Non-Goals:**

- No quest progress persistence across browser refreshes.
- No change to quest definitions, objective criteria, or world-object ownership.
- No second quest tracker, modal, or direct React access to game-layer state.

## Decisions

1. **Keep advancement in the game layer.** The quest manager owns definition
   order and completed IDs, so the game layer will continue calling
   `startNextQuest()` after completion. React will not choose the next quest.

2. **Publish lifecycle events separately from snapshots.** The game layer will
   publish the completed snapshot first, emit a completed lifecycle event, then
   start and publish the next quest and emit its started event. This avoids
   depending on React render timing to infer a transient completed state.
   Alternatives considered were delaying the next quest with a timer, which
   would make gameplay timing nondeterministic, and encoding a transition queue
   into the snapshot, which would mix presentation events with persistent state.

3. **Use the existing FIFO toast queue.** The UI will enqueue the completion
   toast and then the start toast synchronously when it receives the lifecycle
   events. The existing toast reducer already guarantees ordered display and
   does not require a new notification dependency.

4. **Do not emit a start event when no next quest exists.** If advancement
   returns the current completed quest, the game layer will leave the snapshot
   unchanged after publishing completion and will emit no second start event.

5. **Preserve completed HUD presentation.** The existing quest tracker styling
   remains the source of truth for completed and struck-through steps; the
   change only supplies the correct final snapshot and prevents a restart.

## Risks / Trade-offs

- [Risk] Consumers may rely on snapshot-only quest subscriptions. -> Mitigation:
  keep the existing snapshot subscription unchanged and add lifecycle events as
  an additive internal bridge path.
- [Risk] Initial quest startup could produce duplicate start toasts. ->
  Mitigation: retain the existing initial-snapshot fallback only for the first
  pending snapshot; transition events handle manual and automatic starts.
- [Risk] A future quest catalog may contain completed definitions before the
  current quest. -> Mitigation: continue using the manager's later-definition
  and completed-ID selection rule, with tests covering skipped completed quests.

## Migration Plan

Implement the event publication and UI subscription, add focused Node contract
tests, run the production build, and manually verify the transition in the live
app. No data migration or rollback procedure is needed because quest progress
is runtime-only; reverting the code restores the prior snapshot behavior.
