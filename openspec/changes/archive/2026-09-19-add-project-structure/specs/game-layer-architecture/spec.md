# Spec Delta

## MODIFIED Requirements

### Requirement: Separated UI and game layers

The application SHALL expose a `ui_layer` for React-owned user-interface
surfaces, a `game_layer` for the Babylon Lite-owned game surface, and a
deliberate bridge boundary between them. React SHALL own HUD, menus, settings,
dialogs, the Ascii Palette window, the Arguments window, fullscreen controls,
warnings, and other HTML user-interface surfaces. Babylon Lite SHALL own the
game canvas lifecycle, game loop, game input, world state, procedural
generation startup, movement/collision rules, glyph placement, in-world ASCII
rendering, and palette application to rendered world glyphs. The source layout
SHALL represent these boundaries as sibling client layers named
`ui-layer-react`, `bridge-layer`, and `game-layer-babylon-lite`.

#### Scenario: UI layer remains interactive

- **WHEN** the game is running
- **THEN** React-owned UI controls SHALL remain available in `ui_layer`
  without owning the game loop or in-world rendering

#### Scenario: Game layer owns gameplay

- **WHEN** the player moves or the world redraws
- **THEN** Babylon Lite SHALL process game input, update game state, and render
  the game world in `game_layer`

#### Scenario: Client source layout exposes ownership

- **WHEN** a contributor locates client implementation code
- **THEN** React UI, bridge communication, and Babylon Lite gameplay code SHALL
  be discoverable under their corresponding sibling client layer

## ADDED Requirements

### Requirement: Representative templates and mirrored test layout

Each client layer SHALL provide representative template guidance for new
code. The React layer SHALL provide a `Template.jsx` for React component style
and may provide a `Template.js` for UI module style. The bridge and Babylon
Lite layers SHALL provide `.js` templates appropriate to their client roles;
they SHALL NOT use `.jsx` for non-React client code. Layer guidance SHALL
direct contributors and AI agents to begin new work from the closest template
while preserving the template as an example. The test tree SHALL mirror the
corresponding `src/` paths and layer names so tests are locatable by the same
  module boundary as the code they cover, and test filenames SHALL add
  `_tests` before the file extension.

#### Scenario: New React UI work starts from a React template

- **WHEN** a contributor or AI agent adds a React UI component
- **THEN** the closest `ui-layer-react/Template.jsx` pattern and its local
  guidance SHALL be available as the starting reference

#### Scenario: New Babylon client work uses JavaScript templates

- **WHEN** a contributor or AI agent adds a Babylon Lite system, character, or
  renderer
- **THEN** the closest `.js` template SHALL demonstrate the layer's module
  style without introducing JSX into the Babylon client boundary

#### Scenario: Tests mirror source ownership

- **WHEN** a contributor locates or adds a test for a source module
- **THEN** the test SHALL reside under the corresponding mirrored path in
  `ascii-rpg/test/`, including the relevant client layer and module area, with
  `_tests` added to the test filename
