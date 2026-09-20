# Spec Delta

## ADDED Requirements

### Requirement: GPU light pass remains game-layer owned

The Babylon Lite game layer SHALL own GPU-light-pass state, resources, render
work, updates, and disposal. React SHALL present the persisted `Lighting GPU Light Pass`
checkbox and send only its boolean value through the narrow bridge; React
SHALL NOT render the pass, access renderer resources, or receive mutable
visible-cell data.

#### Scenario: UI toggles the presentation mode

- **WHEN** a player changes the `Lighting GPU Light Pass` checkbox in React
- **THEN** React SHALL send a narrow boolean command and Babylon Lite SHALL
  apply the visual mode to its own renderer

#### Scenario: Game layer disposes the presentation resources

- **WHEN** the game layer is replaced or disposed
- **THEN** its GPU-light-pass resources SHALL be released with the game layer
  and React SHALL retain no renderer resource
