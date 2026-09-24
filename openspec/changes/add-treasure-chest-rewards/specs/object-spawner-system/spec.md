# Spec Delta

## ADDED Requirements

### Requirement: Treasure chest catalog and deterministic distribution
The Object Spawner System SHALL define a level-spawned non-pickup Treasure
Chest with distinct closed and open glyphs, both present in the active palette.
For each realm, it SHALL deterministically distribute one, two, or three
closed chests for the selected Low, Med, or High Chest profile respectively.
Each chest SHALL occupy an otherwise eligible walkable cell whose Euclidean
grid-cell distance from that realm's player-start cell is at most 50, while
retaining existing placement exclusions.

#### Scenario: Chest profile produces the selected count in each realm
- **WHEN** a world is generated with Low, Med, or High Chest distribution
- **THEN** each realm SHALL contain one, two, or three eligible closed chests
  respectively within 50 grid cells of its own player start

#### Scenario: Chest distribution is seeded
- **WHEN** the same realm seed and Chest profile are used twice
- **THEN** chest positions and initial closed state SHALL match

### Requirement: Cardinal chest opening and spent state
The Object Spawner System SHALL block movement into a closed Treasure Chest.
When a player attempts a cardinal move into that cell, the chest SHALL change
immediately to its open glyph, remain rendered, and become spent. A spent
chest SHALL remain blocking and SHALL not create another reward on later
cardinal bump attempts.

#### Scenario: Cardinal movement opens a chest
- **WHEN** the player attempts to move left, right, up, or down into a closed
  Treasure Chest
- **THEN** the player SHALL remain in the adjacent cell and the chest SHALL
  render its open glyph

#### Scenario: Opened chest remains blocking
- **WHEN** the player later attempts a cardinal move into an opened Treasure
  Chest cell
- **THEN** the player SHALL remain adjacent and the chest SHALL not create
  another reward

### Requirement: Chest reward spawning
The Object Spawner System SHALL select a chest reward from a weighted subset
of catalog object types and create exactly one instance using the selected
object type's normal behavior. The initial Treasure Chest reward table SHALL
select Heart with 100 percent probability. On opening, the selected reward
SHALL spawn on one randomly selected empty walkable cell among the eight cells
surrounding the chest that is not occupied by the player.

#### Scenario: Opening a chest creates a Heart
- **WHEN** the player opens a closed Treasure Chest
- **THEN** exactly one Heart SHALL appear on an eligible empty surrounding cell,
  including a diagonal when selected, be written to the visible world grid, and
  retain normal Heart pickup behavior

#### Scenario: No eligible reward cell preserves the spent chest
- **WHEN** a chest opens with no empty walkable surrounding cell other than the
  player's cell
- **THEN** the chest SHALL become open and spent without creating a reward
