# Proposal

## Why

The game currently exposes the Ascii Settings window but gives players no comparable surface for reviewing the quest catalog or choosing which quest should begin on the next session. The quest manager already supports ordered definitions and automatic advancement, so a gameplay settings window can make that existing progression model discoverable while preserving the completed final quest in the HUD.

## What Changes

- Add a `Gameplay Settings` launcher beneath `Ascii Settings` in the Windows HUD section.
- Add a Gameplay Settings window with a `Quests` heading and one selectable quest card per definition in `quest_data.json`.
- Render each quest card with the same title-and-task structure and completion strike-through treatment as the quest HUD.
- Persist the selected quest as the browser's `Default Quest` and use it when initializing a new game instance.
- Allow selecting a quest from the window to update the saved default and activate that quest in the current game session.
- Preserve ordered quest progression: after a quest completes, start the next available quest; when there is no next quest, keep the completed quest visible in the HUD.
- Keep quest progress runtime-only; refreshing the browser starts the saved default quest with a fresh runtime state and generated quest pickups.

## Capabilities

### New Capabilities

- `gameplay-settings`: Provides the gameplay settings window, quest selection UI, Default Quest persistence, and responsive modal behavior.

### Modified Capabilities

- `questing-system`: Extend quest initialization from a fixed first quest to a persisted valid default quest, expose quest selection to the UI, and retain ordered completion advancement and final completed-quest HUD behavior.

## Impact

- Affected React UI: `ascii-rpg/src/runtime/ui-layer-react/App.jsx` and window styles.
- Affected bridge/controller surface: the narrow game bridge and game controller quest API.
- Affected quest initialization: `ascii-rpg/src/runtime/game-layer-babylon-lite/index.js` and the existing quest manager integration.
- Affected contract coverage: quest lifecycle/HUD requirements and responsive Windows launcher behavior.
- No new dependencies; browser `localStorage` is the persistence mechanism.
