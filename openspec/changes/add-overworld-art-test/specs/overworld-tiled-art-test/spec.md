# Spec Delta

## Purpose

Provides a standalone, inspectable Tiled project for evaluating the supplied
outdoor art before it becomes a procedural Overworld-level dependency.

## ADDED Requirements

### Requirement: External outdoor source tilesets
The project SHALL provide one external Tiled tileset definition for each PNG in
`Nature-and-Outdoor`, and each definition SHALL resolve to its source PNG when
the Tiled project is opened from the repository checkout.

#### Scenario: Inspect every supplied outdoor sheet
- **WHEN** a creator opens the outdoor-art test project and level in Tiled
- **THEN** all ten supplied outdoor PNGs are available as separate external
  tilesets without moving or copying their source images

### Requirement: Layered outdoor-art test level
The project SHALL provide one finite outdoor-art test level with ordered Dirt,
Water, Rocks, Vegetation, and Details tile layers. The Dirt layer SHALL
contain only grass/dirt source artwork, and the other layers SHALL be empty.

#### Scenario: Review the prepared base layer
- **WHEN** a creator opens the test level in Tiled
- **THEN** the Dirt layer contains the prepared grass/dirt tiles and Water,
  Rocks, Vegetation, and Details contain no placed tiles

### Requirement: Authored-art isolation
The Tiled project and test level SHALL remain authoring assets only and SHALL
NOT become a required input to procedural Overworld generation in this change.

#### Scenario: Generate an Overworld without the Tiled level
- **WHEN** a new procedural Overworld is generated
- **THEN** generation completes without loading or interpreting the Tiled map
  data
