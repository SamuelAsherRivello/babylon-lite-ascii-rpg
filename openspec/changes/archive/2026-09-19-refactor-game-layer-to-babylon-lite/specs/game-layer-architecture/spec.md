# Spec Delta

## Purpose

Defines the final client boundary between the React user-interface layer and
the Babylon Lite game layer so the game has one authoritative owner for input,
simulation, and rendering while UI remains HTML/React.

## ADDED Requirements

### Requirement: Separated UI and game layers

The application SHALL expose a `ui_layer` for React-owned user-interface
surfaces and a `game_layer` for the Babylon Lite-owned game surface. React
SHALL own HUD, menus, settings, dialogs, the Ascii Palette window, the
Arguments window, fullscreen controls, warnings, and other HTML user-interface
surfaces. Babylon Lite SHALL own the game canvas lifecycle, game loop, game
input, world state, procedural generation startup, movement/collision rules,
glyph placement, in-world ASCII rendering, and palette application to rendered
world glyphs.

#### Scenario: UI layer remains interactive

- **WHEN** the game is running
- **THEN** React-owned UI controls SHALL remain available in `ui_layer`
  without owning the game loop or in-world rendering

#### Scenario: Game layer owns gameplay

- **WHEN** the player moves or the world redraws
- **THEN** Babylon Lite SHALL process game input, update game state, and render
  the game world in `game_layer`

### Requirement: Narrow UI-to-game communication

React SHALL communicate with Babylon Lite through deliberate UI commands and
confirmed data snapshots only. Palette updates SHALL use complete, validated
palette snapshots rather than mutable store access or individual glyph patches.
React SHALL NOT directly mutate game state,
movement state, world cells, renderer internals, or input state. Babylon Lite
SHALL remain authoritative for client game state and input.

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
as a client fallback. If Babylon Lite or the required browser rendering
support cannot initialize, the game world SHALL not load.

#### Scenario: Babylon Lite startup succeeds

- **WHEN** Babylon Lite initializes successfully
- **THEN** the game world SHALL load in `game_layer`

#### Scenario: Babylon Lite startup fails

- **WHEN** Babylon Lite or required browser rendering support cannot initialize
- **THEN** the game world SHALL not load and the legacy canvas gameplay path
  SHALL NOT run as a fallback
