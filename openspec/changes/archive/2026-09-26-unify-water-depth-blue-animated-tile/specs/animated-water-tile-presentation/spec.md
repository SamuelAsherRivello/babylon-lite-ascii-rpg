# Spec Delta

## Purpose

Provides one approved blue animated Tiled visual for water while keeping water
terrain, fog, and world-overlay behavior authoritative and consistent.

## ADDED Requirements

### Requirement: Blue animated water terrain presentation
The interactive game world view SHALL present every positively visible
canonical water terrain cell with the same approved blue animated tile from
the checked-in Tiled asset set. The selected animation SHALL use no red or
green variant. Frame advancement SHALL be shared by visible water cells so
the same animation frame is used for every water cell in a render pass.
The presentation SHALL remain derived from the cell's canonical water identity
and SHALL NOT alter its coordinate, walkability, collision, fog state,
terrain identity, or deterministic generated position.

#### Scenario: Visible water uses the blue animated tile
- **WHEN** a canonical water cell is visible in the interactive game world view
- **THEN** it renders the approved blue animated tile at the current shared animation frame
- **AND** it does not render a red or green water variant

#### Scenario: Animation retains water semantics
- **WHEN** the blue water animation advances to a new frame
- **THEN** each affected cell remains canonical water and non-walkable
- **AND** its generated coordinate, fog visibility, and collision behavior remain unchanged

#### Scenario: Fog gates water art
- **WHEN** a canonical water cell has zero fog visibility
- **THEN** the game world view renders no water tile for that cell
- **WHEN** the same cell has positive fog visibility
- **THEN** it renders the blue water tile with the visibility-derived opacity

### Requirement: Water art preserves overlay precedence
The blue animated water tile SHALL occupy only the terrain presentation layer.
A visible character, object, static feature, particle, or other established
overlay on a water cell SHALL retain its existing precedence above the water
tile.

#### Scenario: Overlay remains visible above water
- **WHEN** a visible overlay occupies a canonical water cell
- **THEN** the overlay renders above the blue animated water tile
- **AND** the underlying water terrain remains canonical and non-walkable
