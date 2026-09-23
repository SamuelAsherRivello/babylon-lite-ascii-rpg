# minimap-fog-setting Specification

## Purpose

Provides a clear, persisted control for whether the exploration minimap hides undiscovered world areas with fog of war.

## Requirements

### Requirement: Minimap fog setting
The settings UI MUST expose a `Fog (Checkbox)` control that defaults to enabled, persists its value across browser refreshes, and is cleared by Reset Settings.

#### Scenario: Fog defaults on
- **WHEN** no saved fog preference exists
- **THEN** the `Fog (Checkbox)` control is enabled and the minimap hides undiscovered areas

#### Scenario: Fog preference persists
- **WHEN** the player toggles the fog control and refreshes the browser
- **THEN** the control and minimap retain the selected fog behavior

#### Scenario: Fog disabled
- **WHEN** the player disables `Fog (Checkbox)`
- **THEN** the minimap renders world content and applicable markers without undiscovered-area suppression, while the game's discovery data remains unchanged

#### Scenario: Reset clears fog preference
- **WHEN** the player activates Reset Settings
- **THEN** the stored fog preference is removed and the next initialization uses fog enabled
