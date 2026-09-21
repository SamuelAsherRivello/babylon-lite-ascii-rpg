# Tasks

## 1. Quest transition contract

- [x] 1.1 Extend the quest lifecycle contract so completion selects the next uncompleted definition in order, while the final completed quest remains active without looping; verify with manager tests covering both advancement and terminal completion.
- [x] 1.2 Add an additive game-layer quest lifecycle event path that publishes completion before the next start and emits no start event when there is no next quest; verify event order with focused bridge/game-layer tests.

## 2. HUD and toast integration

- [x] 2.1 Connect React to the ordered quest lifecycle events and enqueue completion then start messages through the existing FIFO toast provider; verify exact toast wording and ordering without duplicate initial-start or completion messages.
- [x] 2.2 Refresh the quest HUD from each published snapshot so the next quest title and active step replace the completed quest, while the final completed quest keeps its struck-through styling; verify with source contract checks and manual browser inspection.

## 3. Validation

- [x] 3.1 Add or update focused Node tests for multiple-quest advancement, skipped completed definitions, final no-loop behavior, bridge lifecycle events, and toast queue ordering; verify the focused test command passes.
- [x] 3.2 Run the repository production build and relevant full test suite from the repository root; record any unrelated or environment-limited failures without weakening the quest assertions.
- [x] 3.3 Manually verify in the running app that completing one quest shows the completion toast followed by the next-start toast and updates the HUD, then complete all quests in one session and verify the final quest remains completed and struck through without restarting. (User-approved closure based on automated coverage and live HUD inspection; full interactive completion path was not reproducibly driven.)
