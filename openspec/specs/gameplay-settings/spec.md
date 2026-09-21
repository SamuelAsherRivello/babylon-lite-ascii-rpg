# gameplay-settings Specification

## Purpose

Provides a responsive gameplay settings window where players can inspect the quest catalog and choose the quest that should be selected by default in a new game session.

## Requirements

### Requirement: Gameplay Settings launcher and window

The lower-left Windows section SHALL display a `Gameplay Settings` control immediately beneath `Ascii Settings`. Activating it SHALL open a modal window with the title `Gameplay Settings`, a `Quests` heading, and a close control.

#### Scenario: Open Gameplay Settings

- **WHEN** a player activates the `Gameplay Settings` control
- **THEN** the Gameplay Settings modal opens above the game canvas and displays its Quests section

#### Scenario: Close Gameplay Settings

- **WHEN** a player activates the close control or the modal backdrop
- **THEN** the Gameplay Settings modal closes and the Windows controls remain usable

### Requirement: Quest catalog cards use HUD presentation

The Gameplay Settings window SHALL render one selectable box for every quest definition in `quest_data.json`. Each box SHALL use the same `Quest: <title>` title line and task lines as the quest HUD, including task progress and strike-through styling for completed quests.

#### Scenario: Render the quest catalog

- **WHEN** the Gameplay Settings window is open
- **THEN** every quest definition appears as a separate box with its title followed by its tasks

#### Scenario: Show completed quest styling

- **WHEN** a quest shown in the catalog is complete in the current runtime
- **THEN** its title and completed task lines use the same strike-through treatment as the quest HUD

### Requirement: Select and persist the Default Quest

The Gameplay Settings window SHALL allow a player to select a valid quest as the `Default Quest`. The selected quest ID SHALL be stored in browser local storage, and the selected card SHALL be visibly identifiable. Selecting a quest SHALL also make it the current quest in the active session.

#### Scenario: Select a default quest

- **WHEN** a player selects a quest card
- **THEN** the quest ID is saved as the Default Quest and that quest becomes the current quest

#### Scenario: Restore the default quest

- **WHEN** the app starts with a saved valid Default Quest
- **THEN** the game begins with that quest selected and its runtime progress starts fresh

#### Scenario: Recover an invalid or missing default

- **WHEN** the app starts without a valid saved Default Quest
- **THEN** the first quest definition is selected, saved as the Default Quest, and started

### Requirement: Responsive gameplay settings window

The Gameplay Settings modal SHALL remain within the browser viewport in supported landscape and portrait presentations. Its quest list MAY scroll, but the title, close control, Quests heading, and quest cards SHALL remain reachable without page overflow.

#### Scenario: Use Gameplay Settings in portrait

- **WHEN** a player opens Gameplay Settings in a portrait or mobile-sized viewport
- **THEN** the modal frame and quest list remain inside the viewport and the quest cards remain selectable
