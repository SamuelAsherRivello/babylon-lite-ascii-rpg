# Spec Delta

## Purpose

Provides supplied gold-key artwork and composed locked-Door presentation across the game world, previews, and HUD.

## ADDED Requirements

### Requirement: Gold-key artwork has cross-surface parity

Every player-visible Key SHALL use `golden_key.png` in the live world, procedural-generation preview, and character resource cell without changing its pickup or inventory meaning.

#### Scenario: Gold Key remains identifiable across surfaces
- **WHEN** a generated Key is shown in the live realm, generation preview, or HUD
- **THEN** each surface SHALL show the gold-key artwork and retain the same Key count and pickup behavior

### Requirement: Locked Doors use a composed presentation

A locked Door SHALL render orientation-specific closed Door artwork plus a separate gold-key overlay. A closed Door SHALL render its closed artwork without that overlay, and an open Door SHALL render open artwork.

#### Scenario: Door state is visually distinguishable
- **WHEN** locked, closed, and open variants of one Door orientation are visible
- **THEN** only the locked variant SHALL show a gold key over closed Door art, and the open variant SHALL use open Door art
