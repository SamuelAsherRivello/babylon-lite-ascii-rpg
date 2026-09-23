# Spec Delta

## ADDED Requirements

### Requirement: Door-led Civilization preview markers
The Underworld procedural settings-map preview SHALL represent each generated Civilization group with its closed-door glyph as the primary Civilization marker. It SHALL also retain exactly two associated key markers for that previewed group, one on each valid side of the door, without mutating the active realm or the generated preview terrain.

#### Scenario: Preview a solvable door group
- **WHEN** the Underworld settings-map preview generates a Civilization group
- **THEN** it displays one closed-door marker and two associated key markers for that group

## MODIFIED Requirements

### Requirement: Selected civilization distribution profile
The Underground civilization pass SHALL apply the selected Doors distribution profile to its door-group placement chance while preserving its existing occupancy, terrain-preservation, two-key solvability, and realm restrictions.

#### Scenario: High civilization profile remains Underground-only
- **WHEN** a world is generated with High Civilization Doors density
- **THEN** only Underground receives the increased door-group placement chance, every accepted door group retains two keys, and Overground receives no civilization features
