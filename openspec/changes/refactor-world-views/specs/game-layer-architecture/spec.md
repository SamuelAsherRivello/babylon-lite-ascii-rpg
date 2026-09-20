# Spec Delta

## MODIFIED Requirements

### Requirement: Separated UI and game layers

The application SHALL expose a `ui_layer` for React-owned user-interface
surfaces and a `game_layer` for Babylon Lite-owned game surfaces. Babylon Lite
SHALL own the game canvas lifecycle, game loop, game input, world state,
procedural generation startup, movement/collision rules, glyph placement,
reusable world-view composition for the game view and mini-map view, active
realm fog state, in-world ASCII rendering, palette application, and the
derived palette/grid lighting pass. React SHALL continue to communicate with
the game layer through the existing narrow bridge and SHALL not own lighting
state, fog state, or per-cell render data.

#### Scenario: UI layer remains interactive

- **WHEN** the game is running
- **THEN** React-owned UI controls SHALL remain available without owning the
  game loop, fog discovery, or in-world rendering

#### Scenario: Game layer owns gameplay and world views

- **WHEN** the player moves or either world view redraws
- **THEN** Babylon Lite SHALL process game input and authoritative world/fog
  state, then render the requested view through its reusable world-view
  composition

#### Scenario: Game layer owns gameplay

- **WHEN** the player moves or the world redraws
- **THEN** Babylon Lite SHALL process game input, update game state, and
  render the requested game world view in `game_layer`

#### Scenario: Runtime source layout exposes ownership

- **WHEN** a contributor locates runtime implementation code
- **THEN** React UI, bridge communication, and Babylon Lite gameplay and
  world-view code SHALL remain discoverable under their corresponding sibling
  runtime layers

#### Scenario: Palette and lighting reach visible glyphs

- **WHEN** the game layer renders a visible discovered world cell
- **THEN** it SHALL resolve the active palette style and apply the cell's
  derived lighting factor before submitting the glyph to Babylon Lite when
  game-view lighting is enabled

#### Scenario: React bridge remains narrow

- **WHEN** React sends a palette update or font/zoom command
- **THEN** the game layer SHALL update its renderer and lighting inputs without
  exposing mutable world cells, fog fields, or requiring React to render the
  grid

#### Scenario: Lighting controls use the bridge

- **WHEN** React changes ambient level, torch profile, or player profile
- **THEN** it SHALL send a narrow lighting command and Babylon Lite SHALL own
  the authoritative values, source calculations, and visible discovered-cell
  rerender
