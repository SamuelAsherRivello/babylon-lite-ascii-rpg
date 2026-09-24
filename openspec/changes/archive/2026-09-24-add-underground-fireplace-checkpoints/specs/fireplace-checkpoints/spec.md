# Spec Delta

## Purpose

Provides discoverable Underground recovery points that preserve a browser-session run without creating a browser-persistent save.

## ADDED Requirements

### Requirement: Underground fireplaces follow configurable density
The game SHALL place persistent Fireplace objects with glyph `🔥` only in the Underground realm. The seeded Fireplace baseline SHALL match the 10–14 object distribution used by traps, with Low, Med, and High yielding one quarter, the baseline, and triple the rounded count respectively. Fireplace cells SHALL be valid, walkable, deterministic for the run seed and selected density, and preserve existing occupancy exclusions. The Fireplace glyph SHALL resolve through the active editable palette.

#### Scenario: Fireplace density changes the count
- **WHEN** an Underground realm uses Low, Med, or High Fireplace density
- **THEN** it SHALL contain the corresponding quarter, baseline, or triple seeded Fireplace count, with no Fireplace sharing a cell with a door, player start, or another placed object

#### Scenario: Overground excludes fireplaces
- **WHEN** an Overground realm finishes object placement
- **THEN** it SHALL contain no Fireplace

#### Scenario: Same seed and density reproduce fireplaces
- **WHEN** the same run seed and Fireplace density are used twice
- **THEN** the Fireplace positions and their corresponding count SHALL match

### Requirement: Fireplace contact saves a session-only checkpoint
When a living player enters a Fireplace cell, the game SHALL replace the active checkpoint with that realm and cell and SHALL enqueue the exact toast `You saved a checkpoint.`. A Fireplace SHALL remain in the world and SHALL save a checkpoint on each later entry. The active checkpoint SHALL not be written to `localStorage`, the URL, or any other browser-persistent storage.

#### Scenario: Player reaches a fireplace
- **WHEN** a living player enters a Fireplace cell
- **THEN** the current realm and Fireplace cell SHALL become the active checkpoint and the exact checkpoint toast SHALL be queued

#### Scenario: Later fireplace supersedes the prior checkpoint
- **WHEN** a player reaches a different Fireplace after an active checkpoint exists
- **THEN** the later Fireplace realm and cell SHALL replace the prior checkpoint

#### Scenario: Refresh does not restore a checkpoint
- **WHEN** the browser page is refreshed after a player reaches a Fireplace
- **THEN** the new browser session SHALL have no active checkpoint

### Requirement: Checkpoint recovery preserves the current run
When the player selects `Restart from checkpoint` after death and an active checkpoint exists, the game SHALL revive the player with current and maximum health of `100`, move the player to that checkpoint's realm and cell, and resume input. It SHALL preserve the current generated world, doors, pickups, inventory, quest state, experience, combat state, and elapsed time. If no checkpoint exists, the `Restart from checkpoint` button SHALL be disabled and SHALL not change the dead run.

#### Scenario: Restart from reached checkpoint
- **WHEN** a dead player selects `Restart from checkpoint` after reaching a Fireplace
- **THEN** the player SHALL be alive at that Fireplace with 100 health and the current run state SHALL otherwise remain unchanged

#### Scenario: Restart before reaching a fireplace
- **WHEN** a player dies without an active checkpoint
- **THEN** the `Restart from checkpoint` button SHALL be disabled and the player SHALL remain dead until another available recovery action is selected
