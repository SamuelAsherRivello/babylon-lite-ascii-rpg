# Spec Delta

## ADDED Requirements

### Requirement: Bounded frame scheduling
The renderer SHALL not continually submit unchanged world frames and SHALL coalesce pending presentation work without disabling visible systems.

#### Scenario: Static world
- **WHEN** world state is unchanged
- **THEN** rendering SHALL remain bounded and browser input SHALL remain responsive
