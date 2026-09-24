# overworld-buildings Specification

## Purpose
Provides reusable seeded Overworld Buildings with concealed walkable interiors,
controlled entrances, and an initial Home type that can be extended later.

## Requirements

### Requirement: Reusable Overworld Building model
The Overworld SHALL support deterministic, multi-cell Buildings that preserve
their underlying natural terrain identity while owning an exterior overlay, an
interior overlay, and one Door entrance. A Building's walls SHALL block entry
from every exterior edge other than its Door; its interior cells SHALL be
effectively walkable. Its exterior overlay SHALL remain visible while the
player is outside that Building, and its interior overlay SHALL be visible
while the player occupies its Door cell or any interior cell. Leaving the Door
cell for an exterior cell SHALL restore that Building's exterior overlay.

#### Scenario: Exterior conceals a Building interior
- **WHEN** a player is outside a generated Building
- **THEN** the Building renders its exterior overlay and its interior cells
  remain inaccessible except through its Door

#### Scenario: Entered Building reveals its interior
- **WHEN** a player enters an unlocked Building Door or walks inside that
  Building
- **THEN** its exterior interior-cover cells render as the Building's interior
  overlay and every interior cell remains walkable

#### Scenario: Exit restores the exterior
- **WHEN** a player moves from a Building Door cell to an exterior cell
- **THEN** that Building's exterior interior-cover cells render again

### Requirement: Home is the first Building type
The first Building type SHALL be an Overworld Home with a 20-column by 10-row
footprint. It SHALL use one consistent wall glyph on its perimeter, `^` roof
glyphs for concealed interior cells, `.` glyphs for revealed interior cells,
and the existing Door glyph at bottom-edge column 10. The Home Door SHALL
start locked and retain the existing Door unlock and open-entry behavior. Each
Home SHALL receive exactly one existing Key on an exterior, walkable, reachable
cell whose shortest cardinal route from the exterior side of its Door is 3-6
grid steps and does not cross that Home's footprint.

#### Scenario: Home has a solvable exterior key
- **WHEN** a Home is accepted for generation
- **THEN** all 200 footprint cells and its Door approach are naturally
  walkable, its Key occupies one reachable exterior cell 3-6 grid steps from
  the Door, and the closed Door blocks entry until that Key is collected

#### Scenario: Home uses the existing Door lifecycle
- **WHEN** a player with the Home's Key attempts to enter its closed Door
- **THEN** the existing key-spend and Door-open behavior occurs without
  revealing the Home until a later movement enters the Door cell

### Requirement: Building placement is isolated and repeatable
The Building pass SHALL consider only Overworld candidates whose complete
footprint, Door approach, and required Key candidate are inside the connected
walkable region. It SHALL reject a candidate that overlaps the player start,
stairs, an existing static object, a previously accepted Building, or a
reserved dynamic occupancy cell. Given identical seed, terrain, settings, and
pre-existing reservations, accepted Buildings, Doors, and Keys SHALL match.

#### Scenario: Invalid footprint is rejected
- **WHEN** any required Home footprint or approach cell is non-walkable or
  reserved
- **THEN** the candidate Home is not generated and no partial Building, Door,
  or Key is created

#### Scenario: Seeded Buildings reproduce
- **WHEN** the same Overworld seed, terrain, settings, and reservations are
  generated twice
- **THEN** the Home footprints, Door cells, and Key cells match exactly
