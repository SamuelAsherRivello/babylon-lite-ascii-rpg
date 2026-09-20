# Spec Delta

## Purpose

Provides a generic quest and collectible-object foundation that can track an
active objective, apply world-object effects, and present progress to the HUD.

## ADDED Requirements

### Requirement: Current quest lifecycle

The system SHALL maintain an active-quest list containing only the current
quest for this release. Each quest SHALL expose `unstarted`, `pending`, and
`complete` states, and SHALL transition to `pending` automatically when the
initial game instance starts.

#### Scenario: Initial quest starts with the game

- **WHEN** a new game instance finishes initializing
- **THEN** the current Collect Gold quest SHALL be pending with progress 0 of 3

#### Scenario: Completed quest remains current

- **WHEN** the current quest reaches its target
- **THEN** the quest SHALL become complete and remain in the active-quest list

### Requirement: Generic collectible pickups

The system SHALL represent a pickup as a world object with an identity, a
world position, a collectible state, and an effect applied when the player
collects it. A collected pickup SHALL be removed from the current world
instance and SHALL NOT be collectible again during that instance.

#### Scenario: Player collects a pickup

- **WHEN** the player occupies the pickup's world cell
- **THEN** the pickup's effect SHALL be applied once and the pickup SHALL no
  longer be rendered or collectible

#### Scenario: Collected pickup is revisited

- **WHEN** the player later returns to a cell whose pickup was collected
- **THEN** the pickup SHALL remain absent and its effect SHALL NOT be applied again

### Requirement: Collect Gold quest

The system SHALL start one Collect Gold quest with a target of three generated
gold pickups. Each gold pickup SHALL use the existing gold glyph `◆` in the
world and SHALL credit the character with exactly one gold when collected.

#### Scenario: Gold pickups are generated

- **WHEN** the Collect Gold quest starts
- **THEN** exactly three collectible gold objects SHALL be placed on valid
  walkable world cells near the configured long-distance placement target

#### Scenario: Gold advances quest progress

- **WHEN** one generated gold pickup is collected
- **THEN** character gold SHALL increase by 1 and quest progress SHALL increase
  by 1

#### Scenario: All gold completes the quest

- **WHEN** the third generated gold pickup is collected
- **THEN** quest progress SHALL be 3 of 3 and the quest SHALL become complete

### Requirement: Quest snapshot bridge

The game layer SHALL publish an immutable quest snapshot through the existing
narrow bridge. The snapshot SHALL include the current quest identity, title,
objective text, lifecycle state, current progress, target progress, and
completion state. React SHALL NOT inspect pickup coordinates or mutable world
state.

#### Scenario: Progress reaches the HUD

- **WHEN** a pickup updates quest progress
- **THEN** the bridge SHALL publish the updated quest snapshot for React HUD
  rendering

### Requirement: Quest HUD tracker

The HUD SHALL render the current quest 25px below the character box. The title
line SHALL read `Question: Collect Gold`. The body line SHALL read
`Collect Gold 0 of 3` initially, use a slightly smaller quest body font, and be
indented 5px. When complete, the HUD SHALL show `Collect Gold 3 of 3` with a
strike-through on the body while keeping the quest visible.

#### Scenario: Active quest presentation

- **WHEN** the current quest is pending with zero progress
- **THEN** the HUD SHALL show the title and indented body beneath the character
  box with the required spacing and text

#### Scenario: Completed quest presentation

- **WHEN** the current quest is complete
- **THEN** the HUD SHALL keep the quest visible and apply strike-through styling
  to the quest body

### Requirement: Runtime-only quest reset

The quest state, generated pickups, collected-pickup state, and pickup gold
effects SHALL be runtime-only for this release. A browser refresh SHALL create
a new game instance with a fresh Collect Gold quest and three new pickups.

#### Scenario: Browser refresh starts a new quest

- **WHEN** the player refreshes the browser after collecting gold
- **THEN** the new game instance SHALL begin with Collect Gold at 0 of 3 and
  regenerated gold pickups
