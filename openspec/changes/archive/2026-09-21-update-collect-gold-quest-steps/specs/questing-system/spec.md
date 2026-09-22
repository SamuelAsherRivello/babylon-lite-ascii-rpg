# Spec Delta

## MODIFIED Requirements

### Requirement: Current quest lifecycle

The system SHALL maintain an active-quest list containing only the current
quest for this release. Each quest SHALL expose `unstarted`, `pending`, and
`complete` states and SHALL maintain an ordered list of steps. The initial
Collect Gold quest SHALL become pending automatically when the initial game
instance starts, with its first step selected according to the initial realm.

#### Scenario: Initial quest starts in Overground

- **WHEN** a new game instance finishes initializing in Overground
- **THEN** the current Collect Gold quest SHALL be pending, its `Enter Overground Realm` step SHALL be complete, and its `Collect Gold` step SHALL show 0 of 3

#### Scenario: Initial quest starts with the game

- **WHEN** a new game instance finishes initializing
- **THEN** the current Collect Gold quest SHALL be pending with its first step determined by the initial active realm

#### Scenario: Initial quest starts in Underground

- **WHEN** a new game instance finishes initializing in Underground
- **THEN** the current Collect Gold quest SHALL be pending with `Enter Overground Realm` active and its `Collect Gold` step SHALL not yet be active

#### Scenario: Completed quest remains current

- **WHEN** the final active quest step reaches its target
- **THEN** the quest SHALL become complete and remain in the active-quest list

### Requirement: Static quest definitions and live state

The system SHALL load static quest definitions from `quest_data.json` and SHALL
keep mutable active-quest state in memory. A quest definition SHALL be able to
declare ordered event-driven steps, including realm-entry steps and relative
gold-pickup criteria. The live state SHALL expose the active step, completed
steps, and each step's progress without exposing mutable world state.

#### Scenario: Relative gold step captures a baseline

- **WHEN** the Collect Gold step becomes active
- **THEN** the live quest state SHALL capture the character's current gold as its baseline and evaluate completion against baseline plus three newly collected gold pickups

#### Scenario: Relative criterion captures a baseline

- **WHEN** a relative gold criterion starts
- **THEN** the live quest state SHALL capture the character's current gold as its baseline and evaluate completion against baseline plus the target amount

#### Scenario: Absolute criterion evaluates current state

- **WHEN** an absolute criterion requires at least 100 gold
- **THEN** the live quest state SHALL complete immediately if the character already has 100 or more gold

#### Scenario: Realm prerequisite is satisfied by current state

- **WHEN** the Collect Gold quest starts while the active realm is Overground
- **THEN** the `Enter Overground Realm` step SHALL be marked complete without waiting for a later realm transition

#### Scenario: Realm prerequisite waits for an event

- **WHEN** the Collect Gold quest starts while the active realm is Underground
- **THEN** the quest SHALL remain on `Enter Overground Realm` until an observed realm-entry event identifies Overground

### Requirement: Collect Gold quest

The system SHALL start one Collect Gold quest with two ordered steps: `Enter
Overground Realm`, followed by `Collect Gold` with a target of three generated
gold pickups. The quest SHALL request or activate its three gold pickups only
after the realm step is complete. Each gold pickup SHALL use the existing gold
glyph and SHALL credit the character with exactly one gold when collected.

#### Scenario: Overground satisfies the first step immediately

- **WHEN** the Collect Gold quest starts in Overground
- **THEN** the quest SHALL expose `Enter Overground Realm` as complete and make `Collect Gold 0 of 3` the active objective

#### Scenario: Underground delays gold activation

- **WHEN** the Collect Gold quest starts in Underground
- **THEN** no quest gold pickup SHALL be requested in Underground and the active objective SHALL remain `Enter Overground Realm`

#### Scenario: Gold pickups are generated

- **WHEN** the Collect Gold step becomes active
- **THEN** exactly three collectible gold objects SHALL be placed on valid walkable cells in the active Overground realm at the configured target distances

#### Scenario: Entering Overground activates gold collection

- **WHEN** the player enters Overground and the realm step is pending
- **THEN** the realm step SHALL complete, the quest SHALL activate `Collect Gold 0 of 3`, and exactly three gold pickups SHALL be requested for the active Overground realm

#### Scenario: Gold advances only the active step

- **WHEN** one generated gold pickup is collected after the Overground step is complete
- **THEN** character gold SHALL increase by 1 and the Collect Gold step SHALL increase by 1

#### Scenario: Gold advances quest progress

- **WHEN** one generated gold pickup is collected
- **THEN** character gold SHALL increase by 1 and quest progress SHALL increase by 1

#### Scenario: All gold completes the quest

- **WHEN** the third generated gold pickup is collected
- **THEN** the Collect Gold step SHALL show 3 of 3 and the quest SHALL become complete

## ADDED Requirements

### Requirement: Generic event observation boundaries

The Quest System SHALL observe generic events emitted by gameplay systems. The
realm system SHALL emit realm-entry events and the Object Spawner System SHALL
emit pickup-collected events; neither producer SHALL contain quest-specific
progression logic or call quest APIs.

#### Scenario: Realm event drives the prerequisite

- **WHEN** the Quest System observes a realm-entry event for Overground while the realm step is active
- **THEN** it SHALL complete that step without reading realm cells or transition internals

#### Scenario: Pickup event drives gold progress

- **WHEN** the Quest System observes a generic gold pickup-collected event while the gold step is active
- **THEN** it SHALL advance gold progress without reading pickup coordinates or object-spawner state

## MODIFIED Requirements

### Requirement: Quest snapshot bridge

The game layer SHALL publish an immutable quest snapshot through the existing
narrow bridge. The snapshot SHALL include the current quest identity, title,
ordered step identity and label, active-step state, per-step progress, lifecycle
state, and completion state. React SHALL NOT inspect pickup coordinates,
realm cells, or mutable world state.

#### Scenario: Ordered progress reaches the HUD

- **WHEN** a realm-entry or pickup event changes quest state
- **THEN** the bridge SHALL publish the updated immutable ordered-step snapshot for React HUD rendering

#### Scenario: Progress reaches the HUD

- **WHEN** a pickup updates quest progress
- **THEN** the bridge SHALL publish the updated quest snapshot for React HUD rendering

### Requirement: Quest lifecycle toasts

The system SHALL show a toast when the current quest starts, when an ordered
step completes or advances, and when the quest completes. Toasts SHALL identify
the relevant step or quest state and SHALL preserve the existing Collect Gold
quest-start and quest-completion notifications.

#### Scenario: Realm step completes

- **WHEN** the player enters Overground and completes the first step
- **THEN** the toast system SHALL report completion of `Enter Overground Realm` and activation of the Collect Gold step

#### Scenario: Quest starts

- **WHEN** the initial quest transitions from unstarted to pending
- **THEN** the toast system SHALL show `Quest Started: Collect Gold.`

#### Scenario: Gold advances

- **WHEN** a gold pickup increases progress from zero to one
- **THEN** the toast system SHALL report `Collect Gold 1 of 3`

#### Scenario: Quest advances

- **WHEN** a gold pickup increases progress from zero to one
- **THEN** the toast system SHALL report `Collect Gold 1 of 3`

#### Scenario: Quest completes

- **WHEN** the third gold pickup completes the final step
- **THEN** the toast system SHALL show `Quest Completed: Collect Gold.`

### Requirement: Quest HUD tracker

The HUD SHALL render the current quest 25px below the character box. The title
line SHALL read `Quest: Collect Gold`. The body SHALL render the ordered steps
in order: `Enter Overground Realm`, followed by `Collect Gold 0 of 3` while
gold collection is pending. Completed steps SHALL remain visible with completed
styling, and the quest SHALL remain visible with completed styling after the
final gold pickup.

#### Scenario: Underground prerequisite presentation

- **WHEN** the current quest is pending in Underground
- **THEN** the HUD SHALL show `Enter Overground Realm` as the active step and SHALL not present gold collection as active progress

#### Scenario: Active quest presentation

- **WHEN** the current quest is pending with zero gold progress
- **THEN** the HUD SHALL show the title and ordered active step beneath the character box with the required spacing and text

#### Scenario: Overground collection presentation

- **WHEN** the realm step is complete and no gold has been collected
- **THEN** the HUD SHALL show the completed `Enter Overground Realm` step and `Collect Gold 0 of 3`

#### Scenario: Completed quest presentation

- **WHEN** the third gold pickup completes the quest
- **THEN** the HUD SHALL keep both steps visible and apply completed styling to the quest steps

### Requirement: Client-only quest reset

The quest state, generated pickups, collected-pickup state, and pickup effects
SHALL be client-only for this release. A browser refresh SHALL create a new
game instance with a fresh two-step Collect Gold quest. The initial realm SHALL
determine whether the first step is already complete, and quest gold SHALL be
generated only after the Overground prerequisite is satisfied.

#### Scenario: Refresh in Overground

- **WHEN** the player refreshes the browser while the active realm is Overground
- **THEN** the new game instance SHALL begin with `Enter Overground Realm` complete and `Collect Gold 0 of 3` active

#### Scenario: Refresh in Underground

- **WHEN** the player refreshes the browser while the stored active realm is Underground
- **THEN** the new game instance SHALL begin on `Enter Overground Realm` without Underground quest gold pickups

#### Scenario: Browser refresh starts a new quest and object set

- **WHEN** the player refreshes the browser after collecting gold
- **THEN** the new game instance SHALL begin with a fresh two-step Collect Gold quest and client-generated pickups appropriate to its initial realm

#### Scenario: Browser refresh starts a new quest

- **WHEN** the player refreshes the browser after collecting gold
- **THEN** the new game instance SHALL begin with a fresh two-step Collect Gold quest and client-generated pickups appropriate to its initial realm
