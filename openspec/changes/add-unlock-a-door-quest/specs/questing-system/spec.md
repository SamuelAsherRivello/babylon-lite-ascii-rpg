# Spec Delta

## ADDED Requirements

### Requirement: Unlock A Door quest definition

The quest catalog SHALL define an `Unlock A Door` quest with the exact ordered
steps `Enter Underground Realm`, `Collect Key 1 of 1`, and `Open a door`. The
quest SHALL use the existing quest snapshot, HUD, selector, and lifecycle
state contracts. The Gameplay Settings `Quests` tab SHALL render one
selectable card for every quest definition in the catalog, including all
existing quests and `Unlock A Door`.

#### Scenario: Quest appears in the catalog

- **WHEN** the quest catalog is loaded
- **THEN** it contains a quest titled `Unlock A Door` with the three named
  steps in the requested order

#### Scenario: Quest is selectable

- **WHEN** a player views Gameplay Settings
- **THEN** every quest definition appears as a selectable quest card,
  including `Unlock A Door`, and selecting any card starts fresh client
  progress for that quest

#### Scenario: Catalog and settings remain complete

- **WHEN** a quest definition is present in `quest_data.json`
- **THEN** the Gameplay Settings `Quests` tab renders that definition with its
  title and ordered task lines without requiring a separate UI registration

#### Scenario: Every quest can become the default

- **WHEN** a player selects any quest card in Gameplay Settings
- **THEN** that quest becomes active immediately, its ID is persisted as the
  Default Quest, and a browser refresh restores that selected quest with fresh
  client progress

### Requirement: Unlock A Door progression

The `Unlock A Door` quest SHALL progress through generic gameplay events. Its
first step SHALL complete when the player enters the Underground realm, its
second step SHALL complete after one existing key pickup, and its final step
SHALL complete after one door-unlocked event. The quest SHALL not request or
create a duplicate key solely for quest progress.

#### Scenario: Underground entry is required first

- **WHEN** `Unlock A Door` is pending outside the Underground realm
- **THEN** the active step is `Enter Underground Realm`, and key or door events
  do not advance the later steps

#### Scenario: Starting Underground satisfies entry

- **WHEN** `Unlock A Door` starts while the active realm is Underground
- **THEN** `Enter Underground Realm` is complete and `Collect Key 0 of 1` is
  the active step

#### Scenario: One key advances the quest

- **WHEN** the active quest observes one Underground key pickup
- **THEN** the realm step remains complete, `Collect Key 1 of 1` becomes
  complete, and `Open a door` becomes active

#### Scenario: Door unlock completes the quest

- **WHEN** the active quest observes one door-unlocked event after the key step
- **THEN** `Open a door` becomes complete and the quest state becomes complete

#### Scenario: Unrelated events do not advance progress

- **WHEN** the active quest observes an Overground entry, non-key pickup, or
  non-unlock event
- **THEN** the active step and its progress remain unchanged

### Requirement: Unlock A Door presentation and reset

The quest snapshot and lifecycle notifications SHALL expose the ordered
progress and completion of `Unlock A Door` using the existing immutable bridge,
HUD, and toast behavior. Quest progress SHALL remain client-only across a
browser refresh, while a persisted valid Default Quest selection SHALL remain
honored. The Gameplay Settings catalog SHALL use the same title, task order,
progress, and completed styling as the HUD for every quest.

#### Scenario: Ordered progress reaches the HUD

- **WHEN** Underground entry, key collection, or door unlocking changes quest
  state
- **THEN** the HUD receives the ordered three-step snapshot with completed
  steps retained and the current step marked active

#### Scenario: Settings cards match the HUD

- **WHEN** a quest is shown in the Gameplay Settings `Quests` tab
- **THEN** its card uses the same title, ordered tasks, progress values, and
  completed styling represented by the quest HUD

#### Scenario: Completion is notified

- **WHEN** the door-unlocked event completes the final step
- **THEN** the existing quest lifecycle notification reports completion of
  `Unlock A Door` and the completed quest remains visible

#### Scenario: Refresh resets client progress

- **WHEN** the browser is refreshed after partial or complete `Unlock A Door`
  progress
- **THEN** the new game instance starts the saved valid Default Quest with
  fresh client quest progress and newly generated world-object state

### Requirement: Active task navigation marker

The active `Unlock A Door` step SHALL provide exactly one nearest navigation
marker on the minimap. `Enter Underground Realm` SHALL target the closest
reachable stairs, `Collect Key` SHALL target the closest active key, and `Open
a door` SHALL target the closest closed door. Completed or inactive steps SHALL
not add navigation markers.

#### Scenario: Underground entry marks one stairs

- **WHEN** `Enter Underground Realm` is the active step
- **THEN** the minimap shows exactly one navigation marker for the closest
  reachable stairs

#### Scenario: Key collection marks one key

- **WHEN** `Collect Key 0 of 1` is the active step
- **THEN** the minimap shows exactly one navigation marker for the closest
  active key

#### Scenario: Door opening marks one door

- **WHEN** `Open a door` is the active step
- **THEN** the minimap shows exactly one navigation marker for the closest
  closed door

#### Scenario: Marker follows active-step changes

- **WHEN** a quest step completes or the player selects another quest
- **THEN** the previous task marker is removed and only the new active task's
  marker remains
