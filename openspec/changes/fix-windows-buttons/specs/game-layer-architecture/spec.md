# Spec Delta

## ADDED Requirements

### Requirement: Window actions cannot deadlock the game layer

React window-launch and close actions SHALL remain narrow UI state transitions and SHALL NOT synchronously recreate, block, or deadlock Babylon Lite rendering, bridge commands, fullscreen handling, or game input.

#### Scenario: Window action during active gameplay
- **WHEN** a player opens or closes any of the three Windows surfaces while the game is rendering
- **THEN** the action SHALL finish and the game layer SHALL continue accepting input and rendering

#### Scenario: Repeated window actions
- **WHEN** a player repeatedly opens and closes all three Windows surfaces
- **THEN** no unbounded render, resize, bridge, or React update loop SHALL occur
