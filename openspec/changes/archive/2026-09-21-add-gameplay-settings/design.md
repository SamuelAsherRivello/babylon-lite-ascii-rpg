# Design

## Context

See `proposal.md` for motivation and user-facing scope. The current React HUD renders `QuestTracker` from an immutable snapshot published by `game-bridge.js`. Quest definitions are loaded by the Babylon game layer from `data/quest_data.json`; `createQuestManager` already supports ordered definitions, `startQuest`, and `startNextQuest`. The current game bootstrap hard-codes the first quest, while the lower-left Windows section and modal styling live in `App.jsx` and `windows.css`.

## Goals / Non-Goals

**Goals:**

- Keep quest definitions authoritative in `quest_data.json` and expose only quest IDs across the UI/game boundary.
- Reuse the HUD quest title/task composition and completion classes in the catalog cards.
- Persist only the selected default quest ID; keep progress, active steps, pickups, and completion client-only.
- Preserve the existing narrow bridge and ordered automatic quest advancement.
- Keep the new modal compatible with the existing responsive window and HUD patterns.

**Non-Goals:**

- Persisting quest progress or completed quests across browser refreshes.
- Adding quest editing, reordering, filtering, or a separate quest database.
- Changing quest criteria, pickup placement, toast wording, or the existing Ascii Settings window.

## Decisions

1. **Use one local-storage key containing a quest ID.** The UI and game bootstrap will validate the stored ID against the imported quest catalog. A missing or invalid value falls back to the first definition and is repaired in storage. This avoids persisting mutable quest state and prevents stale IDs from producing an unknown-quest error.

2. **Start the selected quest through the game controller bridge.** The UI will save the ID and call a narrow `startQuest(id)` bridge action; the game controller will validate the ID and call the existing quest manager with current client values. This preserves the layer boundary: React does not access quest criteria, pickups, or mutable world state.

3. **Make the quest card a presentation variant of the HUD tracker.** A shared quest layout component will receive either the live snapshot or a preview derived from a static definition. The catalog will mark the current selected default without changing quest state, and only a live completed snapshot receives strike-through state.

4. **Keep automatic completion advancement in the game layer.** The existing quest-manager subscription remains responsible for starting the next definition after a completion event. If no later definition exists, it continues publishing the completed snapshot, so the HUD remains on the final completed quest.

5. **Use the existing full-screen prompt window and scroll behavior.** The new modal will use the established backdrop, header, close action, dark theme, and bounded body. The quest list can scroll within the window at small viewport sizes; no new dependency or viewport workaround is needed.

## Risks / Trade-offs

- [Risk] Selecting a quest during an active session resets that quest's client progress and may replace a pending quest. → Make the card selection behavior explicit in the window copy and keep the action limited to the selected quest ID.
- [Risk] A quest definition can be removed after a user saved it. → Validate the stored ID at both UI initialization and game bootstrap, then fall back to and persist the first definition.
- [Risk] The quest catalog can become long on mobile. → Use a bounded modal body/list with normal overflow scrolling and verify portrait presentation manually.
- [Risk] Existing source-based tests may assert the fixed initial quest. → Update focused quest and UI contract tests during implementation, then run the repository's normal Node test and build commands.

## Migration Plan

No data migration is required. On the first session after deployment, the bootstrap stores the first quest ID under the new key. Existing quest progress is not migrated because it was already client-only. Rollback consists of removing the new UI/bridge behavior; the additional local-storage key is harmless and can be ignored by older code.
