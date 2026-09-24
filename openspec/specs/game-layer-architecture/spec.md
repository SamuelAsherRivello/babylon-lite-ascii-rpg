# game-layer-architecture Specification

## Purpose
Defines the final client boundary between the React user-interface layer and
the Babylon Lite game layer so the game has one authoritative owner for input,
simulation, and rendering while UI remains HTML/React.

## Requirements

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

#### Scenario: Client source layout exposes ownership

- **WHEN** a contributor locates client implementation code
- **THEN** React UI, bridge communication, and Babylon Lite gameplay and
  world-view code SHALL remain discoverable under their corresponding sibling
  client layers

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

### Requirement: Narrow UI-to-game communication

React SHALL communicate with Babylon Lite through deliberate UI commands and
confirmed data snapshots only. Palette updates SHALL use complete, validated
palette snapshots rather than mutable store access or individual glyph patches.
React SHALL NOT directly mutate game state, movement state, world cells,
renderer internals, or input state. Babylon Lite SHALL remain authoritative
for client game state, stamina-derived combat statistics, and damage
resolution. Babylon Lite SHALL publish only immutable Offense and Defense
snapshots needed by the Character HUD; React SHALL not calculate those values.

#### Scenario: Palette command
- **WHEN** a developer confirms an Ascii Palette edit in React
- **THEN** React SHALL send the confirmed palette snapshot to Babylon Lite and Babylon Lite SHALL apply it to in-world glyph rendering

#### Scenario: Startup argument consumption
- **WHEN** React changes a supported argument such as `?randomSeed=value` through its Arguments UI
- **THEN** React SHALL write the URL and Babylon Lite SHALL consume that argument when the game starts; React SHALL NOT send it as a live game command

#### Scenario: Combat snapshot remains narrow
- **WHEN** stamina changes after an attack or movement-driven recovery
- **THEN** Babylon Lite SHALL publish immutable Offense and Defense current/max snapshots and React SHALL update only the corresponding HUD bars

#### Scenario: React cannot resolve combat damage
- **WHEN** a player or enemy attack is resolved
- **THEN** Babylon Lite SHALL calculate current Offense, current Defense, and applied damage without requiring React state or UI calculations

### Requirement: Player GPU shadow-bleed command remains narrow

React SHALL persist and present the `Player GPU Shadow Bleed Range` setting,
then send only its selected scalar range through the existing narrow bridge.
The Babylon Lite game layer SHALL own the selected range, all player-shadow
mask data, GPU presentation resources, and their disposal. React SHALL NOT
inspect world cells, light fields, shadow masks, or renderer resources.

#### Scenario: UI changes player shadow-bleed range

- **WHEN** a player changes `Player GPU Shadow Bleed Range` in Settings
- **THEN** the game layer SHALL apply the selected range to subsequent player
  GPU light presentation without changing simulation state

#### Scenario: Stored range restores after game-controller registration

- **WHEN** the UI loads a stored player GPU shadow-bleed range before the game
  layer registers its controller
- **THEN** the bridge SHALL provide the latest selected range when that
  controller becomes available

### Requirement: No legacy gameplay fallback
The application SHALL run its Babylon Lite game surface without retaining a legacy gameplay fallback. If required browser rendering support cannot initialize or is lost, the game SHALL report unavailable state without loading an alternate gameplay renderer.

#### Scenario: Babylon Lite startup succeeds
- **WHEN** Babylon Lite initializes successfully
- **THEN** the game world SHALL load in `game_layer` and remain responsive to React controls

#### Scenario: Babylon Lite startup fails
- **WHEN** required rendering support cannot initialize or is lost
- **THEN** the game world SHALL not load and no legacy gameplay path SHALL run

### Requirement: Responsive interactive rendering

The game SHALL coalesce rendering work so UI actions remain dispatchable while
all gameplay, lighting, fog, minimap, palette, font, zoom, camera, and realm
systems operate.

#### Scenario: Menu interaction during gameplay

- **WHEN** a player opens or uses any left-side menu control while a world is rendered
- **THEN** the action completes without freezing or crashing the browser

### Requirement: Narrow realm lifecycle commands
React SHALL send only deliberate realm-restart and ambient-preference commands
through the existing bridge. Babylon Lite SHALL own generated realm data,
active world and realm selection, player transfer, per-realm fog, collision,
and rendering; React SHALL NOT inspect or mutate realm cells or fog fields.
Babylon Lite SHALL also own the authoritative rendered player marker and SHALL
remove stale player markers before presenting a destination realm, so only the
current controllable player is rendered.

#### Scenario: UI restarts a named realm through the bridge
- **WHEN** the player activates a named realm restart control
- **THEN** the bridge sends that named request and Babylon Lite replaces the
  realm without exposing mutable world or fog data to React

#### Scenario: Realm activation presents one player
- **WHEN** Babylon Lite activates a realm at startup or after a transfer
- **THEN** it renders one player marker at the authoritative player position,
  removes any stale generated start marker, and keeps movement input attached
  to that same player

### Requirement: Narrow active-realm status snapshot
Babylon Lite SHALL publish an immutable active-world and active-realm status
snapshot through the bridge for React HUD display. React SHALL persist only
the active realm identifier and SHALL NOT persist or inspect generated realm
data, player coordinates, terrain, or fog.

#### Scenario: Realm transfer updates HUD status
- **WHEN** the player transfers through paired stairs
- **THEN** the bridge updates React with the new active realm so the HUD and
  stored realm preference match gameplay

### Requirement: Window actions cannot deadlock the game layer

React window-launch and close actions SHALL remain narrow UI state transitions and SHALL NOT synchronously recreate, block, or deadlock Babylon Lite rendering, bridge commands, fullscreen handling, or game input.

#### Scenario: Window action during active gameplay
- **WHEN** a player opens or closes any of the three Windows surfaces while the game is rendering
- **THEN** the action SHALL finish and the game layer SHALL continue accepting input and rendering

#### Scenario: Repeated window actions
- **WHEN** a player repeatedly opens and closes all three Windows surfaces
- **THEN** no unbounded render, resize, bridge, or React update loop SHALL occur

### Requirement: Game-owned exploration and minimap rendering

Babylon Lite SHALL own fog-of-war state, discovery evaluation, minimap fog
opacity calculation, and unlit world-content minimap rendering. React SHALL
NOT own a minimap visibility control or send visibility through the bridge;
it SHALL NOT receive or render mutable world cells,
discovery data, or minimap cells.

#### Scenario: Minimap presentation stays game-owned

- **WHEN** a world is generated or updated
- **THEN** Babylon Lite keeps the minimap rendered without a visibility
  command or React-owned world and fog data

#### Scenario: Game layer retains fog authority

- **WHEN** the player moves or a world is generated
- **THEN** Babylon Lite updates discovery and fog-masked minimap content
  without React owning the world state or performing per-cell rendering

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

### Requirement: Object Spawner System remains game-layer authoritative

Babylon Lite SHALL own object catalog loading, seeded distribution, object collision, pickup consumption, object consequences, object rendering, Torch lighting inputs, object/minimap state, and the authoritative player-death transition. React SHALL communicate only through existing narrow snapshots and SHALL not inspect object positions, mutable object state, health mutation, or lifecycle internals.

#### Scenario: Object consequence stays in the game layer
- **WHEN** the player collides with a Gold, Heart, Trap, Torch, or Stair object
- **THEN** Babylon Lite SHALL apply the object behavior and publish only the resulting approved UI snapshots or log entries

#### Scenario: Death state stays in the game layer

- **WHEN** a health consequence reaches zero health
- **THEN** Babylon Lite SHALL mark the player dead and publish only the immutable health and death snapshots needed by React

### Requirement: Continuous renderer handoff during realm swaps

Babylon Lite SHALL preserve renderer-layer continuity while replacing the
active realm during a covered transition. Realm replacement SHALL update the
existing game-layer presentation or otherwise keep an attached presentation
surface available for the destination frame; it SHALL NOT expose a transient
state in which the active game layer has been removed before its replacement is
ready.

#### Scenario: Covered swap retains an attached game presentation

- **WHEN** Babylon Lite replaces the active realm at the transition midpoint
- **THEN** the game renderer SHALL retain an attached presentation surface from
  the midpoint through the first destination render

#### Scenario: Destination presentation precedes mask opening

- **WHEN** the destination world and its visible cells have been submitted
  during the covered phase
- **THEN** the destination frame SHALL be synchronously presented before the
  transition mask exposes any transparent aperture

#### Scenario: React UI remains outside the repair

- **WHEN** the renderer handoff is performed
- **THEN** the React UI layer and its controls SHALL remain above and
  independent of the game-layer transition surface

### Requirement: Stamina and sprint state remain game-layer authoritative

Babylon Lite SHALL own current/max stamina, enemy-attack costs, sprint cadence,
movement-tick recovery, clamping, and exhausted movement behavior. React SHALL receive
stamina only through the existing narrow immutable snapshot bridge. The bridge
MAY include immutable previous-value and revision metadata needed to visualize
a transient delta, but React SHALL not own or mutate gameplay stamina or sprint
state.

#### Scenario: React renders an authoritative stamina snapshot

- **WHEN** the game starts, movement succeeds, or a T tick occurs
- **THEN** Babylon Lite SHALL publish current/max stamina and immutable
  transition metadata needed by the HUD without exposing mutable player or
  world state

#### Scenario: UI cannot become a second stamina owner

- **WHEN** React renders or rerenders the Character box
- **THEN** it SHALL derive the meter presentation from the latest snapshot and
  SHALL not calculate attack costs, recovery, or cadence

### Requirement: Tickable entity simulation remains game-layer authoritative

Babylon Lite SHALL own the tickable-entity registry, world-time tick dispatch, birth and age state, enemy and spawner simulation, dynamic occupancy, pathfinding, combat, health, death, and health-bar presentation. React SHALL NOT receive or mutate enemy positions, spawner positions, entity health, birth times, tick registrations, pathfinding state, or health-bar animation state.

#### Scenario: World tick stays in Babylon Lite
- **WHEN** world time advances and entities in either realm simulate
- **THEN** Babylon Lite SHALL complete simulation and rendering updates without exposing mutable entity state through the React bridge

#### Scenario: Combat publishes only approved snapshots
- **WHEN** enemy combat changes player health or produces a log line
- **THEN** React SHALL receive only the existing immutable player-health, player-death, and log snapshots

### Requirement: Simulation and presentation are decoupled

The game layer SHALL simulate registered entities regardless of active realm, fog discovery, or visible region, while submitting glyphs and health-bar overlays only for entities that belong to the active realm and intersect the current visible presentation.

#### Scenario: Offscreen enemy still simulates
- **WHEN** an enemy processes a tick outside the visible region
- **THEN** its authoritative state SHALL update without submitting an onscreen glyph or health bar

#### Scenario: Realm switch reveals current simulated state
- **WHEN** the player enters a realm whose enemies simulated while inactive
- **THEN** the game renderer SHALL show their current positions and health rather than stale pre-simulation state

### Requirement: Floating text remains game-layer owned and render-gated

Babylon Lite SHALL own floating-text health-change event capture, lifetime timing, positioning, rendering, resources, and disposal. React SHALL NOT receive floating-text records, entity health deltas for presentation, mutable entity positions, or renderer resources. The game layer SHALL create floating text only for health changes affecting entities that are currently rendered in the active game world view, so offscreen tick simulation does not allocate presentation records.

#### Scenario: React does not own floating text
- **WHEN** a visible health delta creates floating text
- **THEN** Babylon Lite owns the floating text record and React receives no floating-text-specific snapshot or renderer resource

#### Scenario: Offscreen simulation avoids presentation work
- **WHEN** an offscreen or inactive-realm entity receives a health delta during a world-time tick
- **THEN** the game layer updates simulation state without allocating a floating-text presentation record

### Requirement: Developer mapview remains game-layer owned

Babylon Lite SHALL own mapview world rendering, mutable world data, entity positions, enemy and spawner state, fog bypass evaluation, diagnostic lighting, marker projection, and keyboard input suppression while the mapview is open. React SHALL own only the Info launcher, overlay open/close state, and narrow commands or snapshots needed to request the mapview; React SHALL NOT receive or render mutable world cells, fog fields, entity collections, enemy positions, or renderer resources.

#### Scenario: React launches without owning world data
- **WHEN** a developer activates the `Map` control
- **THEN** React sends only a narrow mapview open request and does not receive mutable world cells or entity collections

#### Scenario: Game layer owns mapview rendering
- **WHEN** the mapview is visible
- **THEN** Babylon Lite renders the active realm and marker overlay from authoritative game-layer state

#### Scenario: Closing mapview restores input ownership
- **WHEN** the mapview closes
- **THEN** Babylon Lite restores normal keyboard input handling without React mutating game input state directly

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

### Requirement: Publish generic successful cardinal movement events

The game layer SHALL dispatch a generic event for each successful cardinal
player movement using the explicit event meanings `player moved up`, `player
moved down`, `player moved left`, and `player moved right`. These events SHALL
be emitted for both keyboard and canvas-swipe movement. The game layer SHALL
not contain tutorial-specific state, sequencing, or completion logic. Any UI
consumer MAY listen for these events, but SHALL NOT receive or mutate player
coordinates, collision state, world cells, or movement timers.

#### Scenario: Keyboard movement event

- **WHEN** a mapped arrow-key input successfully moves the player one cardinal
  grid cell
- **THEN** the game dispatches exactly one corresponding generic player-moved
  event, such as `player moved up`

#### Scenario: Swipe movement event

- **WHEN** a cardinal canvas swipe successfully moves the player one grid cell
- **THEN** the game dispatches exactly one corresponding generic player-moved
  event

#### Scenario: Blocked movement event

- **WHEN** keyboard or swipe input cannot move the player into its destination
- **THEN** the game dispatches no player-moved event

#### Scenario: Diagonal movement events

- **WHEN** a diagonal input successfully moves the player
- **THEN** the game dispatches no cardinal player-moved event for that single
  diagonal step

#### Scenario: Tutorial remains an event consumer only

- **WHEN** the tutorial updates progress after receiving a player-moved event
- **THEN** the tutorial changes only its own UI state and the game contains no
  tutorial-specific progress or completion behavior
