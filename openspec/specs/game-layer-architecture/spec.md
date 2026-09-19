# game-layer-architecture Specification

## Purpose
Defines the final runtime boundary between the React user-interface layer and
the Babylon Lite game layer so the game has one authoritative owner for input,
simulation, and rendering while UI remains HTML/React.

## Requirements

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

#### Scenario: Runtime source layout exposes ownership

- **WHEN** a contributor locates runtime implementation code
- **THEN** React UI, bridge communication, and Babylon Lite gameplay code SHALL
  remain discoverable under their corresponding sibling runtime layers

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

### Requirement: Representative templates and mirrored test layout

Each runtime layer SHALL provide representative template guidance for new
code. The React layer SHALL provide a `Template.jsx` for React component style
and may provide a `Template.js` for UI module style. The bridge and Babylon
Lite layers SHALL provide `.js` templates appropriate to their runtime roles;
they SHALL NOT use `.jsx` for non-React runtime code. Layer guidance SHALL
direct contributors and AI agents to begin new work from the closest template
while preserving the template as an example. The test tree SHALL mirror the
corresponding `src/` paths and layer names so tests are locatable by the same
module boundary as the code they cover, and test filenames SHALL add
`_tests` before the file extension.

#### Scenario: New React UI work starts from a React template

- **WHEN** a contributor or AI agent adds a React UI component
- **THEN** the closest `ui-layer-react/Template.jsx` pattern and its local
  guidance SHALL be available as the starting reference

#### Scenario: New Babylon runtime work uses JavaScript templates

- **WHEN** a contributor or AI agent adds a Babylon Lite system, character, or
  renderer
- **THEN** the closest `.js` template SHALL demonstrate the layer's module
  style without introducing JSX into the Babylon runtime boundary

#### Scenario: Tests mirror source ownership

- **WHEN** a contributor locates or adds a test for a source module
- **THEN** the test SHALL reside under the corresponding mirrored path in
  `ascii-rpg/test/`, including the relevant runtime layer and module area, with
  `_tests` added to the test filename

### Requirement: Narrow UI-to-game communication

React SHALL communicate with Babylon Lite through deliberate UI commands and
confirmed data snapshots only. Palette updates SHALL use complete, validated
palette snapshots rather than mutable store access or individual glyph patches.
React SHALL NOT directly mutate game state,
movement state, world cells, renderer internals, or input state. Babylon Lite
SHALL remain authoritative for runtime game state and input.

#### Scenario: Palette command

- **WHEN** a developer confirms an Ascii Palette edit in React
- **THEN** React SHALL send the confirmed palette snapshot to Babylon Lite and
  Babylon Lite SHALL apply it to in-world glyph rendering

#### Scenario: Startup argument consumption

- **WHEN** React changes a supported argument such as `?randomSeed=value`
  through its Arguments UI
- **THEN** React SHALL write the URL and Babylon Lite SHALL consume that
  argument when the game starts; React SHALL NOT send it as a live game command

### Requirement: No legacy gameplay fallback

The application SHALL NOT retain the legacy React-mounted canvas gameplay path
as a runtime fallback. If Babylon Lite or the required browser rendering
support cannot initialize, the game world SHALL not load.

#### Scenario: Babylon Lite startup succeeds

- **WHEN** Babylon Lite initializes successfully
- **THEN** the game world SHALL load in `game_layer`

#### Scenario: Babylon Lite startup fails

- **WHEN** Babylon Lite or required browser rendering support cannot initialize
- **THEN** the game world SHALL not load and the legacy canvas gameplay path
  SHALL NOT run as a fallback
