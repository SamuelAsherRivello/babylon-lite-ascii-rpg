# Spec Delta

## MODIFIED Requirements

### Requirement: Home is the first Building type

The first Building type SHALL be an Overworld Home with a 20-column by 10-row footprint. It SHALL use one consistent wall glyph on its perimeter, `^` roof glyphs for concealed interior cells, `.` glyphs for revealed interior cells, and one bottom-edge Door at column 10. The Home Door SHALL use front Door art, start locked, display the gold-key overlay while locked, and retain the shared locked-to-open key-spend behavior. Each Home SHALL receive exactly one Key on an exterior, walkable, reachable cell whose shortest cardinal route from the exterior side of its Door is 3-6 grid steps and does not cross that Home's footprint.

#### Scenario: Home has a solvable exterior key
- **WHEN** a Home is accepted for generation
- **THEN** all 200 footprint cells and its Door approach are naturally walkable, its Key occupies one reachable exterior cell 3-6 grid steps from the Door, and the locked Door blocks entry until that Key is collected

#### Scenario: Home uses the existing Door lifecycle
- **WHEN** a player with the Home's Key attempts to enter its locked Door
- **THEN** the shared key-spend behavior SHALL open the front Door without revealing the Home until a later movement enters the Door cell
