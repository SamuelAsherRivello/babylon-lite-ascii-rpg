# Spec Delta

## MODIFIED Requirements

### Requirement: Occupied movement resolves player combat

Before committing cardinal or diagonal player movement, the game layer SHALL check dynamic entity occupancy at the destination. If the destination contains a living enemy or spawner, the attempted movement SHALL deal the player's base `20` damage to that entity, leave the player and target in their original cells, and advance world time by one. If the destination contains an NPC, the attempted movement SHALL leave the player and NPC in their original cells and SHALL not deal damage, consume stamina, award experience, emit combat output, or advance world time. If combat damage destroys an enemy or spawner, its cell SHALL become available only after the combat action completes; the player SHALL NOT enter it during the same input.

#### Scenario: Cardinal movement attacks enemy
- **WHEN** the player attempts a cardinal step into a living enemy cell
- **THEN** the enemy SHALL lose 20 health, neither entity SHALL move, and world time SHALL advance by one

#### Scenario: Diagonal movement attacks spawner
- **WHEN** the player attempts a diagonal step into a living spawner cell
- **THEN** the spawner SHALL lose 20 health, neither entity SHALL move, and world time SHALL advance by one

#### Scenario: NPC blocks movement without combat
- **WHEN** the player attempts a cardinal or diagonal step into a living NPC cell
- **THEN** neither actor SHALL move, world time SHALL remain unchanged, and no combat effect SHALL occur

#### Scenario: Lethal attack does not also move
- **WHEN** a player attack reduces the target to zero health
- **THEN** the target SHALL be removed but the player SHALL remain in the original cell until a later movement input
