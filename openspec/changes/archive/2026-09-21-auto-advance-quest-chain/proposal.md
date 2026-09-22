# Proposal

## Why

The game now contains multiple quests, but completing one can leave the player
without a clear transition into the next objective. The quest flow should
continue through the catalog during one session while making the completion and
next-start states visible and preserving the final completed quest.

## What Changes

- Automatically advance from a completed quest to the next uncompleted quest in
  definition order when another quest exists.
- Publish the completed quest state before publishing the next pending quest so
  the HUD can reflect both transitions.
- Show `Quest Completed: <title>.` followed by `Quest Started: <title>.` in
  FIFO toast order for an automatic transition.
- Update the quest HUD to the newly started quest and its initial active step.
- When no uncompleted quest remains, keep the final quest active, completed, and
  visibly struck through; do not restart or loop the quest catalog during the
  session.
- Preserve client-only quest progress and the existing manual quest-selection
  behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `questing-system`: Define ordered multi-quest session progression, transition
  notifications, and terminal completed-quest behavior.

## Impact

- Affects the quest manager and game-layer quest event publication.
- Affects the bridge path used by React to receive quest snapshots and ordered
  lifecycle events.
- Affects the React quest HUD and toast integration.
- Adds focused coverage for automatic advancement, toast ordering, HUD snapshot
  replacement, and the no-loop final-quest state.
- No new dependencies or persistence changes are required.
