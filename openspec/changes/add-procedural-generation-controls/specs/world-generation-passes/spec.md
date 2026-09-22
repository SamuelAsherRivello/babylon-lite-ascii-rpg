# Spec Delta

## ADDED Requirements

### Requirement: Density profiles preserve pass ownership and order
The generation pipeline SHALL resolve each selected pass density into parameters owned by that pass without reordering the existing pipeline or allowing a pass to rewrite another pass's layer.

#### Scenario: Apply selected cave and water profiles
- **WHEN** a world is generated with non-Med Cave / Walls and Water selections
- **THEN** cave wall fill and water distribution use their selected profiles independently and retain the existing pass order
