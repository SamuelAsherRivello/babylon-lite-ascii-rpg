# Spec Delta

## ADDED Requirements

### Requirement: Game-layer transitions do not cover the UI layer

Transition presentation SHALL be owned and mounted within `game_layer` and
SHALL cover the complete game presentation, including its game-layer canvases,
without covering or disabling the React-owned `ui_layer`. The transition mask
SHALL not become a React-rendered gameplay surface or expose mutable world
state to React.

#### Scenario: HUD remains visible during an iris

- **WHEN** a realm transition is closing, covered, or opening
- **THEN** the React HUD and settings surfaces remain visible above the game
  layer and are not obscured by the black iris

#### Scenario: Game layer owns transition state

- **WHEN** a transition is active
- **THEN** Babylon Lite owns its animation progress, mask rendering, input lock,
  midpoint callback, and disposal without React inspecting world cells or
  renderer internals

