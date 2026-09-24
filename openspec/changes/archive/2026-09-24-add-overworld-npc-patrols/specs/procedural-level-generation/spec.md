# Spec Delta

## MODIFIED Requirements

### Requirement: Dynamic entity state remains separate from terrain and static objects

The generated world SHALL retain NPCs, NPC spawners, enemies, and enemy spawners as explicit dynamic entity state associated with a realm. Their glyphs SHALL take visible precedence over terrain while preserving underlying terrain and static-object identity. No cell SHALL contain more than one player, NPC, NPC spawner, enemy, or enemy-spawner occupant.

#### Scenario: NPC moves without rewriting terrain
- **WHEN** an NPC moves from one walkable cell to another
- **THEN** both cells SHALL retain their original terrain and static-object data while dynamic occupancy changes

#### Scenario: Enemy moves without rewriting terrain
- **WHEN** an enemy moves from one walkable cell to another
- **THEN** both cells SHALL retain their original terrain and static-object data while dynamic occupancy changes

#### Scenario: Destroyed entity reveals underlying cell
- **WHEN** an enemy or spawner is removed at zero health
- **THEN** its former cell SHALL render the underlying object or terrain according to normal precedence

## ADDED Requirements

### Requirement: NPC density generation control

The Procedural Level Generation menu SHALL expose an `NPC` pass with visually clear Low, Med, and High choices. Its persisted selection SHALL default to Med and determine the Overground NPC-spawner count as 4, 8, or 12 respectively. The selected setting SHALL be used for a newly generated world and SHALL not affect Underground NPC placement.

#### Scenario: NPC setting is visible and persists
- **WHEN** a player opens the Procedural Level Generation menu and selects an NPC density
- **THEN** the `NPC` label, Low/Med/High choices, and selected choice SHALL be clearly visible, and the selection SHALL persist for the next generated world

#### Scenario: NPC density determines spawner count
- **WHEN** an Overground world is generated with Low, Med, or High NPC density
- **THEN** it SHALL contain exactly 4, 8, or 12 NPC spawners respectively

#### Scenario: NPC density is visible on the preview map
- **WHEN** the Procedural map preview shows an Overground draft with an NPC density selected
- **THEN** it SHALL overlay the matching deterministic NPC-spawner cells using a prominent marker that is at least as visible as the heart, trap, and torch preview symbols

### Requirement: Surface-scoped world graphics

Every world graphic, including terrain, objects, actors, NPCs, spawners, effects, and markers, SHALL be prepared and drawn only when its cell lies in the active surface's source region and has positive fog visibility in that surface's realm. The game view, minimap, and developer map view SHALL each use their own source region and matching fog record.

#### Scenario: Fogged NPC is not submitted
- **WHEN** an NPC or NPC spawner is outside positive fog visibility for a rendering surface
- **THEN** that surface SHALL not prepare, submit, or draw its glyph, marker, or overlay

#### Scenario: Off-region actor is not submitted
- **WHEN** an NPC, spawner, or other actor is outside a rendering surface's source region
- **THEN** that surface SHALL not prepare, submit, or draw that actor

### Requirement: NPC-spawner generation is seed-stable

Given the same Overground world identity, dimensions, generation parameters, and object positions, normal NPC-spawner positions SHALL be repeatable.

#### Scenario: Normal NPC spawners reproduce
- **WHEN** the same Overground inputs are generated twice
- **THEN** normal NPC-spawner counts and positions SHALL match exactly
