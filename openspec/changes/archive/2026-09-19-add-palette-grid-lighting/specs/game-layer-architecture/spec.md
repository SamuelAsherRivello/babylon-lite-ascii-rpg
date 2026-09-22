# Spec Delta

## MODIFIED Requirements

### Requirement: Separated UI and game layers

The application SHALL expose a `ui_layer` for React-owned user-interface
surfaces and a `game_layer` for the Babylon Lite-owned game surface. Babylon
Lite SHALL own the game canvas lifecycle, game loop, game input, world state,
procedural generation startup, movement/collision rules, glyph placement,
in-world ASCII rendering, palette application, and the derived palette/grid
lighting pass. React SHALL continue to communicate with the game layer through
the existing narrow bridge and SHALL not own lighting state or per-cell render
data.

#### Scenario: UI layer remains interactive

- **WHEN** the game is running
- **THEN** React-owned UI controls SHALL remain available without owning the
  game loop or in-world rendering

#### Scenario: Game layer owns gameplay

- **WHEN** the player moves or the world redraws
- **THEN** Babylon Lite SHALL process game input, update game state, and render
  the game world in `game_layer`

#### Scenario: Client source layout exposes ownership

- **WHEN** a contributor locates client implementation code
- **THEN** React UI, bridge communication, and Babylon Lite gameplay code SHALL
  remain discoverable under their corresponding sibling client layers

#### Scenario: Palette and lighting reach visible glyphs

- **WHEN** the game layer renders a visible world cell
- **THEN** it SHALL resolve the active palette style and apply the cell's
  derived lighting factor before submitting the glyph to Babylon Lite

#### Scenario: React bridge remains narrow

- **WHEN** React sends a palette update or font/zoom command
- **THEN** the game layer SHALL update its renderer and lighting inputs without
  exposing mutable world cells or requiring React to render the grid

#### Scenario: Lighting controls use the bridge

- **WHEN** React changes ambient level, torch profile, or player profile
- **THEN** it SHALL send a narrow lighting command and Babylon Lite SHALL own
  the authoritative values, source calculations, and visible-cell rerender
