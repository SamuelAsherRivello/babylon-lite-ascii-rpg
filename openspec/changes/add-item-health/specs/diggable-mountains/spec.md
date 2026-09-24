# Spec Delta

## MODIFIED Requirements

### Requirement: Attempted movement into a mountain performs a dig attack

When a player attempts a cardinal or diagonal step into an interior Overground mountain with health above zero and has a Pickaxe, the game SHALL apply the existing player attack damage calculation and resolve one full attack turn. The turn SHALL spend the normal attack stamina cost, advance world time by exactly one, award the normal attack experience, and reduce Pickaxe health by the actual mountain health removed. The player and mountain SHALL remain in their cells for that input, including when the hit is lethal. If the player has no Pickaxe, no digging attack SHALL resolve.

#### Scenario: Player digs and wears Pickaxe
- **WHEN** a movement attempt targets an interior Overground mountain with positive health and the player has a Pickaxe
- **THEN** the mountain SHALL lose the Offense-scaled damage, Pickaxe SHALL lose the same actual health removed, and the normal dig turn effects SHALL occur

#### Scenario: Diagonal movement attempt digs with Pickaxe
- **WHEN** a diagonal movement attempt targets an interior Overground mountain and the player has a Pickaxe
- **THEN** the same single dig attack and Pickaxe durability loss SHALL resolve without moving the player

#### Scenario: Missing Pickaxe cannot dig
- **WHEN** a movement attempt targets an interior Overground mountain and the player has no Pickaxe
- **THEN** the mountain SHALL receive no damage and no dig turn SHALL be consumed

#### Scenario: Player digs into an interior mountain
- **WHEN** a movement attempt targets an interior Overground mountain with positive health and the player has a Pickaxe
- **THEN** the mountain SHALL lose the Offense-scaled damage for one player attack, the player SHALL stay in place, stamina SHALL pay the normal attack cost, world time SHALL advance by one, and attack experience SHALL be awarded

#### Scenario: Diagonal movement attempt digs
- **WHEN** a diagonal movement attempt targets an interior Overground mountain with positive health and the player has a Pickaxe
- **THEN** the same single dig attack SHALL resolve without moving the player
