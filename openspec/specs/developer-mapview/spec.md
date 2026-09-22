# developer-mapview Specification

## Purpose
Provides a fullscreen developer-only mapview for inspecting generated world layout, item placement, and enemy distribution without changing gameplay state.

## Requirements

### Requirement: Developer Map launcher

The lower-left Info section SHALL expose a `Map` control below the live information readouts. Activating `Map` SHALL show only the fullscreen mapview and lower-left controls containing a visible `X` close control and `Toggle Realm` control. The overlay SHALL hide the normal game presentation, minimap, developer HUD, and any other UI while open. Closing the mapview SHALL restore the previous presentation without resetting the world, changing the active realm, moving the player, or modifying persisted gameplay settings, and SHALL release mapview-only canvas backing memory and mapview-only cached render resources.

#### Scenario: Open Map from Info
- **WHEN** a developer activates the `Map` control in the Info section
- **THEN** a fullscreen mapview overlay opens as the only visible presentation
- **AND** the mapview presents only lower-left `X` and `Toggle Realm` controls above the map

#### Scenario: Close Map
- **WHEN** the mapview overlay is open and the developer activates its close control
- **THEN** the mapview closes and the active game session remains in the same realm and player position
- **AND** mapview-only render buffers and caches are cleared

### Requirement: Full-realm diagnostic rendering

The mapview SHALL render the player's current realm as another world-view instance when opened, independent of the player-facing minimap crop. The mapview SHALL provide `Toggle Realm` to cycle the diagnostic map target through the generated realms without changing the player's active gameplay realm or position. In landscape presentation, the initial mapview scale SHALL fit the entire selected realm inside the visible overlay without requiring scrolling. The mapview SHALL reveal the full selected realm regardless of current fog discovery and SHALL render world content as fully visible.

#### Scenario: Opens on player realm
- **WHEN** the player is in a gameplay realm and opens the mapview
- **THEN** the mapview initially renders that same realm

#### Scenario: Toggle Realm
- **WHEN** the mapview is open and the developer activates `Toggle Realm`
- **THEN** the mapview cycles to another generated realm
- **AND** the active gameplay realm and player position remain unchanged

#### Scenario: Landscape fit
- **WHEN** the mapview opens in landscape presentation
- **THEN** the full selected realm is visible inside the overlay without clipping or scrollbars

#### Scenario: Fog does not hide mapview content
- **WHEN** cells in the active realm are undiscovered in gameplay fog state
- **THEN** the mapview still renders those cells as visible world content

#### Scenario: Mapview does not mutate discovery
- **WHEN** the mapview renders undiscovered cells
- **THEN** the gameplay fog and discovery state remain unchanged

### Requirement: Diagnostic lighting

The mapview SHALL render world content with effective ambient lighting set to `1`. Player, torch, profile, shadow, and GPU light-pass settings SHALL NOT darken or brighten the mapview world content.

#### Scenario: Ambient one
- **WHEN** the active game's ambient lighting is below `1`
- **THEN** opening the mapview renders world content at full ambient visibility

#### Scenario: Lighting settings remain unchanged
- **WHEN** the mapview renders with diagnostic lighting
- **THEN** the existing game and minimap lighting settings remain unchanged after the mapview closes

### Requirement: Diagnostic markers

The mapview SHALL draw minimap-style markers over the rendered world content for developer-relevant active world state, including start position, current player position, active quest objects, torches, items, enemies, and spawners. Markers SHALL render above world content and SHALL remain visible regardless of fog discovery. The mapview SHALL NOT draw minimap quest edge indicators or offscreen navigation indicators.

#### Scenario: Entity distribution is visible
- **WHEN** the active realm contains generated items, enemies, and spawners
- **THEN** the mapview displays markers for their current world positions above the world content

#### Scenario: No quest edge indicators
- **WHEN** an active quest object exists anywhere in the active realm
- **THEN** the mapview may show its in-world marker but does not draw edge chevrons or boundary indicators

#### Scenario: Markers are fog-independent
- **WHEN** a marker target is in an undiscovered cell
- **THEN** the mapview still displays that marker at its world position

### Requirement: Gameplay input suppression

While the mapview overlay is open, keyboard input SHALL NOT move the player, advance gameplay commands, change camera mode, or trigger other game-layer keyboard actions. Closing the mapview SHALL restore the existing keyboard input behavior.

#### Scenario: Keyboard input is ignored while open
- **WHEN** the mapview is open and the developer presses movement keys
- **THEN** the player position and game keyboard-controlled state remain unchanged

#### Scenario: Keyboard input resumes after close
- **WHEN** the developer closes the mapview and then presses movement keys
- **THEN** normal gameplay keyboard input is available again
