# Spec Delta

## ADDED Requirements

### Requirement: Overworld Buildings are generated after prerequisite object reservations
The world generator SHALL generate Overworld Buildings after player position and existing static-object reservations are available. Each accepted Building SHALL also claim exactly one valid interior chest position and create its house-owned treasure chest without rewriting natural terrain or changing the independently configured object-distribution chest count.

#### Scenario: Building pass claims a house chest
- **WHEN** an Overworld Building is accepted after prerequisite reservations are known
- **THEN** its one house-owned chest is added to the object layer at a valid interior corner and the cell is reserved against later conflicting placement

#### Scenario: Building pass preserves natural terrain
- **WHEN** a house and its chest are generated
- **THEN** the generator preserves the underlying terrain identity and uses the object/building layers for the chest and house presentation

#### Scenario: Chest distribution remains additive
- **WHEN** standalone chest generation is configured for a given density
- **THEN** that configured standalone chest count remains in addition to the guaranteed house chests
