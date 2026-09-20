# Spec Delta

## ADDED Requirements

### Requirement: Paired stairs use torch density target
The game layer SHALL request the same stair count as its requested
screen-relative torch count. A shortage of valid paired stair coordinates
SHALL yield a deterministic valid subset and SHALL NOT invalidate otherwise
valid realm generation.

#### Scenario: Stairs target torch count
- **WHEN** the game layer requests a screen-relative torch count for a world
- **THEN** it requests that same count for synchronized paired stairs
