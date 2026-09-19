# Spec Delta

## Purpose

Provides an ordered, deterministic pass pipeline for composing future world
generation features without coupling each feature to the others.

## ADDED Requirements

### Requirement: Ordered world-generation passes

The world generator SHALL compose terrain through distinct passes in this
order: ground, cave/walls, water, walkability, and player position. A later
pass SHALL be able to inspect prior layers and claim or derive only its own
layered result.

#### Scenario: Passes execute in dependency order

- **WHEN** a world is generated
- **THEN** ground exists before cave/walls, cave/walls exist before water,
  water exists before walkability, and walkability exists before player
  placement

#### Scenario: Future layer can be added without reordering existing layers

- **WHEN** a later world-generation feature is introduced
- **THEN** it SHALL be representable as a pass with an explicit insertion
  point and SHALL NOT require unrelated passes to own or rewrite its data

### Requirement: Pass-scoped generation parameters

Each generation pass SHALL receive explicit parameters controlling the amount
or behavior of the layer it owns. A pass SHALL apply its configured values
instead of deriving coverage from viewport dimensions or unrelated defaults.

#### Scenario: Water coverage uses its own parameter

- **WHEN** a caller supplies a water coverage parameter
- **THEN** the water pass SHALL use that parameter independently of cave wall
  fill and smoothing parameters

### Requirement: Deterministic shared generation context

All passes SHALL use the world generation's resolved seed and shared context so
that identical dimensions and parameters reproduce identical layers and player
placement.

#### Scenario: Seeded pass pipeline is repeatable

- **WHEN** the generator runs twice with identical dimensions, parameters, and
  seed
- **THEN** every generated layer and the selected player position SHALL match

