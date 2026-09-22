# map-window Specification

## Purpose
Defines the developer-only fullscreen map window used to inspect generated
realm layout, item placement, enemy distribution, and spawner distribution
without changing gameplay state.

## Requirements

### Requirement: Developer-only launcher

The lower-left developer `Info` section SHALL expose a `Map` control for
opening the map window. The map window SHALL be a developer-only diagnostic
surface and SHALL NOT be presented as a normal player gameplay control.

#### Scenario: Developer opens map window
- **WHEN** the developer activates `Map` from the `Info` section
- **THEN** the map window opens fullscreen
- **AND** normal HUD and gameplay UI are hidden while the map window is open

### Requirement: Fullscreen isolated presentation

The map window SHALL show only the rendered map plus lower-left controls. The
lower-left controls SHALL include `X` to close the map window and
`Toggle Realm` to change the diagnostic realm being viewed. No map title,
normal HUD content, minimap, log, or settings controls SHALL remain visible
while the map window is open.

#### Scenario: Map window visible content
- **WHEN** the map window is open
- **THEN** the only visible controls are `X` and `Toggle Realm`
- **AND** the map rendering occupies the fullscreen map surface

### Requirement: Diagnostic realm rendering

The map window SHALL open on the player's current gameplay realm. The
`Toggle Realm` control SHALL cycle the map window through the generated realms
for diagnostic viewing without changing the player's active gameplay realm,
player position, persisted realm preference, or gameplay state.

#### Scenario: Opens on current realm
- **WHEN** the player is in a realm and opens the map window
- **THEN** the map window initially renders that same realm

#### Scenario: Toggle realm is diagnostic only
- **WHEN** the map window is open and the developer activates `Toggle Realm`
- **THEN** the map window cycles to another generated realm
- **AND** the player's active gameplay realm and position remain unchanged

### Requirement: Map rendering mode

The map window SHALL render the selected realm through the shared world-view
rendering pipeline with a full-realm source rectangle. In landscape, the map
window SHALL fit the full selected realm on screen without scrolling. The map
window SHALL bypass fog for its diagnostic rendering, SHALL use effective
ambient lighting `1`, and SHALL NOT mutate fog discovery or lighting settings.

#### Scenario: Full selected realm is visible
- **WHEN** the map window opens in landscape presentation
- **THEN** the full selected realm is visible inside the fullscreen map surface

#### Scenario: Fog and lighting are diagnostic only
- **WHEN** the selected realm contains undiscovered cells
- **THEN** those cells are visible in the map window
- **AND** gameplay fog discovery and lighting settings remain unchanged

### Requirement: Diagnostic markers

The map window SHALL draw minimap-style diagnostic markers for developer-
relevant world state, including start position, player position for the
player's active realm, active quest objects, torches, items, enemies, and
spawners. The map window SHALL NOT draw minimap quest edge indicators or
offscreen navigation indicators.

#### Scenario: Distribution markers are visible
- **WHEN** the selected realm contains items, enemies, or spawners
- **THEN** the map window displays their markers above world content

#### Scenario: Quest edge indicators are omitted
- **WHEN** an active quest target is outside the player's immediate gameplay
  view
- **THEN** the map window may display the target's in-world marker
- **AND** it does not display minimap edge chevrons or offscreen indicators

### Requirement: Map rendering is cooperative and cancellable

The map window SHALL render its fullscreen diagnostic map through the
cooperative world-view rendering mode. Opening, toggling, resizing, or closing
the map window SHALL keep browser input and UI presentation responsive while
the full selected realm is being drawn. Closing the map window, changing the
diagnostic realm, resizing the map surface, or disposing the game layer SHALL
cancel any stale map-window render job before it can draw more content.

#### Scenario: Opening map remains responsive during render
- **WHEN** the developer opens the map window for a generated realm large
  enough to require multiple render batches
- **THEN** the map window appears without blocking browser input until the full
  realm render completes
- **AND** the map content progressively fills in bounded batches

#### Scenario: Realm toggle cancels stale render
- **WHEN** a map-window render is still in progress and the developer activates
  `Toggle Realm`
- **THEN** the previous realm render is cancelled
- **AND** subsequent map content and diagnostic markers correspond only to the
  newly selected realm

#### Scenario: Close releases active map render resources
- **WHEN** the map window is closed while a cooperative render is still pending
- **THEN** the pending render is cancelled
- **AND** map-window-only canvas backing memory and cached render resources are
  released according to the existing cleanup contract

#### Scenario: Markers remain above completed world content
- **WHEN** the map window completes its cooperative render
- **THEN** diagnostic markers render above the completed world content
- **AND** stale markers from an interrupted render are not shown over a newer
  realm or resized surface

### Requirement: Input and resource cleanup

While the map window is open, gameplay keyboard input SHALL NOT move the
player, advance gameplay commands, change camera mode, or trigger other
game-layer keyboard actions. Closing the map window with `X` SHALL restore
normal input behavior and SHALL release map-window-only canvas backing memory
and cached render resources. The map window SHALL NOT write a rendered map
artifact to disk.

#### Scenario: Gameplay input is suppressed
- **WHEN** the map window is open and the developer presses movement keys
- **THEN** player position and keyboard-controlled gameplay state remain
  unchanged

#### Scenario: Close releases map resources
- **WHEN** the developer activates `X`
- **THEN** the map window closes
- **AND** map-window-only render buffers and caches are cleared
- **AND** no disk-backed map artifact remains to delete
