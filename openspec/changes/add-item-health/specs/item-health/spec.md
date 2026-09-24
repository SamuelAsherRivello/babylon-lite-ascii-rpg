# Spec Delta

## Purpose

Defines durable inventory equipment so combat, digging, defense, and the character HUD communicate finite item resources and clear depletion behavior.

## ADDED Requirements

### Requirement: Equipment has finite health

The inventory Sword, Pickaxe, and Shield SHALL each start with `1000` current health and `1000` maximum health. Item health SHALL be authoritative gameplay state and SHALL be published with the character inventory snapshot.

#### Scenario: Equipment starts at full health
- **WHEN** a new playable character is initialized
- **THEN** Sword, Pickaxe, and Shield each SHALL report `1000 / 1000` health

### Requirement: Successful attacks consume Sword health

Each successful Sword attack against an enemy or enemy spawner SHALL reduce Sword health by the actual target damage applied by that attack. Sword health SHALL be clamped to zero.

#### Scenario: Sword loses attack damage
- **WHEN** a Sword attack applies `20` damage to an enemy
- **THEN** Sword health SHALL decrease by `20`

### Requirement: Successful digging consumes Pickaxe health

Each successful Pickaxe hit against an interior Overground mountain SHALL reduce Pickaxe health by the actual mountain health removed. Pickaxe health SHALL be clamped to zero.

#### Scenario: Pickaxe loses mountain damage
- **WHEN** a Pickaxe hit removes `20` health from a mountain
- **THEN** Pickaxe health SHALL decrease by `20`

### Requirement: Incoming damage consumes Shield health

Each incoming enemy attack that applies damage to the player SHALL reduce Shield health by the final damage applied after the existing Defense calculation. Shield health SHALL be clamped to zero.

#### Scenario: Shield loses applied player damage
- **WHEN** an enemy attack applies `3` damage to the player after Defense mitigation
- **THEN** Shield health SHALL decrease by `3`

### Requirement: Depleted equipment is removed and unavailable

When Sword, Pickaxe, or Shield health reaches zero, that item SHALL be removed from its inventory slot. A missing Sword SHALL prevent further Sword attacks, a missing Pickaxe SHALL prevent further mountain digging, and a missing Shield SHALL prevent shield-based Defense mitigation while leaving the body damage path active.

#### Scenario: Depleted Sword cannot attack
- **WHEN** Sword health reaches zero and the player attempts to attack an enemy
- **THEN** the attack SHALL not resolve and Sword SHALL remain absent from the inventory

#### Scenario: Depleted Pickaxe cannot dig
- **WHEN** Pickaxe health reaches zero and the player attempts to enter an interior mountain
- **THEN** no digging damage SHALL resolve and Pickaxe SHALL remain absent from the inventory

#### Scenario: Depleted Shield no longer mitigates
- **WHEN** Shield health reaches zero and an enemy attacks the player
- **THEN** the player SHALL receive the existing body-path damage without shield-based Defense mitigation
