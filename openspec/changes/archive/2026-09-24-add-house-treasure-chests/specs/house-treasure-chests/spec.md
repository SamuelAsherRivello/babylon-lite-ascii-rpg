# Spec Delta

## Purpose

Guarantees that exploring every generated Overworld house yields one discoverable, interactive treasure chest while preserving the existing independently distributed chest population.

## ADDED Requirements

### Requirement: Every generated house contains one treasure chest
Each accepted Overworld house SHALL contain exactly one additional regular treasure chest in one of its four walkable interior corner cells. A house that is rejected during generation SHALL create no chest.

#### Scenario: Accepted house receives one chest
- **WHEN** an Overworld house is accepted for generation
- **THEN** exactly one house-owned chest is present inside that house at an interior corner cell

#### Scenario: Rejected house receives no chest
- **WHEN** a candidate house fails footprint, approach, key, or reservation validation
- **THEN** no house-owned chest or partial house object is created

### Requirement: House chest corner placement is deterministic and non-overlapping
The selected house chest cell SHALL be one of the four interior cells immediately inside the house corners, SHALL be walkable after house generation, and SHALL not overlap the door, key, another object, another house, or the player start. Identical generation inputs SHALL select the same corner.

#### Scenario: Chest uses an interior corner
- **WHEN** a house is generated
- **THEN** its chest cell is one of the four valid interior corner cells and is not a wall or exterior cell

#### Scenario: Existing reservations are respected
- **WHEN** all four interior corner cells are unavailable
- **THEN** the house candidate is rejected rather than placing the chest outside the house or replacing another object

#### Scenario: Seeded generation is repeatable
- **WHEN** the same terrain, settings, reservations, and seed generate the Overworld twice
- **THEN** each accepted house has the same chest cell and house ownership in both results

### Requirement: House chests use normal treasure interaction
House-owned chests SHALL use the same closed/open glyphs, collision and interaction rules, reward selection, chest-opened event, logging, and quest-observable behavior as independently generated treasure chests.

#### Scenario: Player opens a house chest
- **WHEN** the player interacts with an unopened house-owned chest
- **THEN** it opens through the normal chest lifecycle, produces its normal reward behavior, and emits the normal chest-opened event

#### Scenario: Opened house chest remains handled
- **WHEN** the player interacts with an already opened house-owned chest
- **THEN** the chest remains open and no second reward is created

### Requirement: Standalone chest generation remains independent
Adding house-owned chests SHALL NOT disable, replace, or change the configured standalone chest generation pass or its density-driven count.

#### Scenario: Standalone and house chests coexist
- **WHEN** standalone chest generation and house generation are both enabled
- **THEN** the resulting Overworld contains the configured standalone chests plus one additional chest for every accepted house, subject to valid non-overlapping placement
