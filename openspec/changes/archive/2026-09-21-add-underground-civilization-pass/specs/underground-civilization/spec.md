# Spec Delta

## Purpose

Adds the first man-made exploration layer to Underground realms through seeded
fences, locked doors, collectible keys, and a visible key inventory.

## ADDED Requirements

### Requirement: Underground civilization barriers are seeded and solvable

The Underground realm SHALL run a civilization pass after natural terrain,
water, walkability, and player placement. An eligible barrier SHALL span a
straight 3–10 cell walkable opening between cave walls. At zoom 5, each
eligible screen region SHALL have approximately a 10% seeded chance of
receiving at most one barrier. A candidate SHALL be skipped unless one key
can be placed between five and ten grid steps on each side of its door, never
adjacent to the door.

#### Scenario: Valid barrier candidate
- **WHEN** an Underground screen contains a qualifying wall-bounded opening
- **THEN** the civilization pass MAY place one seeded fence line with one door

#### Scenario: Invalid key placement candidate
- **WHEN** a candidate cannot support key placement on both sides
- **THEN** the candidate SHALL remain unchanged

#### Scenario: Same seed reproduces civilization
- **WHEN** the same Underground seed, dimensions, terrain, and zoom-5 screen
  layout are generated twice
- **THEN** barrier, door, and key positions SHALL match exactly

### Requirement: Civilization glyphs have stable visual identities

Civilization rendering SHALL use `─` for horizontal fences, `│` for vertical
fences, `█` for closed doors, `□` for open doors, and `⚿` for keys. Every
glyph SHALL resolve through the active editable palette before it is rendered.

#### Scenario: Civilization glyphs render through the palette
- **WHEN** a generated fence, door, or key is visible
- **THEN** its configured civilization glyph SHALL render with the active
  palette style

### Requirement: Keys are collectible inventory pickups

Each generated key SHALL be a one-time pickup. When the player enters its cell,
the key SHALL disappear, the shared player key count SHALL increase by one, and
the Log System SHALL receive `The key was collected.`.

#### Scenario: Player collects a key
- **WHEN** the player enters a visible key cell
- **THEN** the key SHALL be consumed once, the key count SHALL increase by one,
  and `The key was collected.` SHALL be logged

#### Scenario: Re-entering a collected key cell
- **WHEN** the player enters a cell whose key was already collected
- **THEN** the key count SHALL not increase again and no duplicate collection
  SHALL occur

### Requirement: Doors unlock without moving the player

Fences and closed doors SHALL block movement. When a player attempts a
cardinal move into a closed door without a key, the player SHALL remain in
place and `The door is locked.` SHALL be logged. When the player has a key, the
same attempted move SHALL spend one key, log `A key was spent.` and `The door
unlocked.`, change the door to its open glyph, and leave the player in the
current cell. A later movement attempt SHALL be required to enter the open
door. An opened door SHALL remain open for the current level session.

#### Scenario: Locked door without a key
- **WHEN** the player attempts to move into a closed door with zero keys
- **THEN** the player SHALL remain in place, the door SHALL remain closed, and
  `The door is locked.` SHALL be logged

#### Scenario: Door unlock with a key
- **WHEN** the player attempts to move into a closed door while holding a key
- **THEN** one key SHALL be spent, both unlock messages SHALL be logged, the
  door SHALL render open, and the player SHALL remain in place

#### Scenario: Player enters an opened door
- **WHEN** the player attempts the same direction again after the door opens
- **THEN** the player SHALL enter the door cell and movement SHALL proceed
  through the now-walkable doorway

#### Scenario: Door unlock from either side
- **WHEN** the player approaches a closed door from any cardinally adjacent
  side with a key
- **THEN** the same unlock behavior SHALL apply
