# variable-overworld-houses Specification

## Purpose
Provides varied, size-aware Overworld Homes so procedural settlements are less repetitive while preserving the existing enterable-house interaction and deterministic generation behavior.

## Requirements

### Requirement: Homes SHALL use the defined size catalog

Each generated Home MUST have one of the following footprints: `SMALL` is 7 cells wide by 5 cells high, `MED` is 10 cells wide by 5 cells high, and `HIGH` is 20 cells wide by 10 cells high. `HIGH` MUST preserve the current Home footprint.

#### Scenario: Each size has the requested footprint
- **WHEN** a Home is generated with a named size
- **THEN** its recorded width and height and all wall/interior cells match that size's dimensions

### Requirement: Home size selection SHALL be equally likely

For each accepted Home selection, the generator MUST select `SMALL`, `MED`, or `HIGH` with equal one-third probability using the generation's seeded random source. The selection MUST be deterministic for the same seed and generation inputs.

#### Scenario: Equal size choices are available
- **WHEN** the generator considers a Home placement
- **THEN** each of the three size definitions has the same selection probability and the selected size is recorded on the Home

#### Scenario: Seeded generation is repeatable
- **WHEN** the same world, seed, settings, and reserved cells are generated twice
- **THEN** the same Home origins, sizes, keys, and cells are produced in the same order

### Requirement: Placement SHALL be size-aware

The generator MUST reject a candidate when its selected footprint, Door approach, or exterior Key route is invalid or overlaps reserved cells. A smaller Home MUST be eligible in terrain where a larger Home cannot fit, provided its own complete footprint and required cells are valid.

#### Scenario: Small terrain accepts a smaller Home
- **WHEN** a walkable candidate region can contain a 7-by-5 Home but cannot contain a 10-by-5 or 20-by-10 Home
- **THEN** the generator MAY place a `SMALL` Home there and MUST NOT place a partial larger Home

#### Scenario: No partial footprint is created
- **WHEN** any cell in the selected Home footprint, Door approach, or required exterior route is blocked or reserved
- **THEN** that candidate is rejected without creating a Home, Door, Key, or overlay cells

### Requirement: Size variants SHALL preserve Home interaction and presentation

Every size MUST have one perimeter wall, one bottom-edge Door, an exterior roof glyph, and a concealed interior that reveals as walkable interior glyphs only while the player is inside. The Door, Key, collision, NPC/enemy reservations, and exit restoration behavior MUST remain equivalent across sizes.

#### Scenario: Player enters any size
- **WHEN** the player unlocks and enters a `SMALL`, `MED`, or `HIGH` Home
- **THEN** the selected Home's interior is revealed, its interior cells are walkable, and its walls remain blocking

#### Scenario: Player exits any size
- **WHEN** the player leaves the selected Home through its Door to the exterior
- **THEN** the selected Home's roof presentation is restored without mutating natural terrain

### Requirement: Preview SHALL match runtime size selection

The deterministic Overworld procedural preview MUST use the same size catalog and seeded size-selection rules as runtime generation and MUST show exactly one marker for each accepted Home.

#### Scenario: Preview represents varied Homes
- **WHEN** the Overworld preview is generated with a seed and Homes enabled
- **THEN** it uses the same Home sizes and origins that runtime generation would select for the corresponding preview inputs and emits one marker per accepted Home
