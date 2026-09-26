# procedural-level-generation Specification

## Purpose
Provides an explicit-size procedural ASCII world with connected walkable
terrain, separate terrain and character layers, and deterministic rendering
precedence for the current player.

## Requirements

### Requirement: Explicit procedural world generation

The Babylon Lite game layer SHALL generate a world from explicit positive
`rows` and `columns` inputs independent of the browser viewport dimensions.

#### Scenario: Generate requested dimensions

- **WHEN** the generator receives `rows: 20` and `columns: 40`
- **THEN** the resulting world SHALL contain exactly 20 rows and 40 columns

### Requirement: Configurable cave generation

The Babylon Lite game layer SHALL accept a wall-fill percentage, a
smoothing-pass count, and an optional caller-provided seed. It SHALL apply the
configured values while using the fixed light 4–5 cellular-automata rule for
neighbor classification.

#### Scenario: Seeded generation is repeatable

- **WHEN** the generator is called twice with identical dimensions, fill,
  smoothing, and seed values
- **THEN** both generated terrain layouts SHALL be identical

#### Scenario: Fill and smoothing affect generation

- **WHEN** the generator receives valid wall-fill and smoothing values
- **THEN** it SHALL use those values rather than silently replacing them with
  viewport or player defaults

### Requirement: Resolved generation seed

Each generated world SHALL have a resolved seed. When the caller supplies a
seed, the Babylon Lite game layer SHALL use and retain that seed. When the
caller omits a seed, the game layer SHALL create and retain a fresh seed for
that generation so a new level is random without becoming unrepeatable.

#### Scenario: Omitted seed creates a fresh reproducible level identity

- **WHEN** the generator creates a world without a caller-provided seed
- **THEN** the returned world SHALL expose the generated seed used for its
  terrain layout

#### Scenario: Caller-provided seed is retained

- **WHEN** the generator creates a world with a caller-provided seed
- **THEN** the returned world SHALL expose that same seed as its resolved seed

#### Scenario: Retained seed reproduces the level

- **WHEN** a generated world's resolved seed is passed to the generator with
  the same dimensions and generation parameters
- **THEN** the resulting terrain layout SHALL match the original layout

### Requirement: Bordered connected playable terrain

The generated terrain SHALL use `W` for non-walkable walls, `•` for ordinary
walkable ground, and one canonical water glyph for non-walkable water. The
outermost row and column SHALL remain walls. After cave and water generation,
the final walkable region SHALL be connected and meet the configured minimum
walkable-area requirement.

#### Scenario: Outer border is non-walkable

- **WHEN** a world is generated
- **THEN** every cell in the outermost row and column SHALL be `W` and have
  `walkable: false`

#### Scenario: Water depth controls traversal

- **WHEN** a generated terrain cell contains canonical water
- **THEN** the cell SHALL be non-walkable

#### Scenario: Deeper water blocks traversal

- **WHEN** a generated terrain cell contains canonical water
- **THEN** the cell SHALL be non-walkable

#### Scenario: Final playable region is connected

- **WHEN** a generated world is accepted
- **THEN** the final ground cells used for movement SHALL form one connected
  region large enough to contain the player start cell

#### Scenario: Player region is connected

- **WHEN** a generated world is accepted
- **THEN** its final playable region SHALL consist of one connected walkable
  area large enough to contain the player start cell

### Requirement: Layered world data
The Babylon Lite game layer SHALL retain level-spawned objects, Underground civilization features, and Overworld Buildings in explicit layers associated with the terrain and character layers. Object and static-feature glyphs SHALL take visible precedence over terrain while preserving underlying natural terrain identity. Torch, Trap, Heart, and Stair objects SHALL not make their cells non-walkable; Building perimeter walls, fences, and closed doors SHALL block effective movement, while Building interiors and open doors SHALL be walkable.

#### Scenario: Walkable object occupies natural terrain
- **WHEN** a Heart, Torch, Trap, or Stair is placed in a valid generated world
- **THEN** its cell SHALL retain the underlying walkable terrain and expose the object through the object layer

#### Scenario: Object occupies a walkable terrain cell
- **WHEN** a level-spawned object is placed
- **THEN** its cell SHALL retain the underlying walkable terrain and expose the object through the object layer

#### Scenario: Barrier occupies natural terrain
- **WHEN** a fence or closed door is placed in an Underground opening
- **THEN** the underlying natural terrain SHALL remain available while the civilization layer marks the cell as blocked for movement

#### Scenario: Building wall occupies natural terrain
- **WHEN** a Building perimeter wall is placed on Overworld terrain
- **THEN** its cell SHALL retain its natural terrain identity while the Building layer marks it blocked for movement

#### Scenario: Open door preserves walkability
- **WHEN** a closed door changes to its open state
- **THEN** the open door SHALL remain rendered above the natural terrain and its cell SHALL become walkable

#### Scenario: Object is rendered above terrain
- **WHEN** an undiscovered or discovered cell contains a visible object or civilization glyph
- **THEN** the active topmost glyph SHALL render above the terrain glyph using its palette style

#### Scenario: Player occupies a walkable terrain cell
- **WHEN** the player is placed at a valid start cell
- **THEN** that cell SHALL retain its walkable terrain in the terrain layer and contain `🤺` in the character layer

#### Scenario: Water retains terrain identity under a character
- **WHEN** a character occupies a shallow-water cell
- **THEN** the visible character SHALL render while the underlying water glyph, depth, and walkability remain available in the terrain layer

#### Scenario: Torch occupies a walkable terrain cell
- **WHEN** a Torch is placed in a valid generated world
- **THEN** that cell SHALL retain its underlying walkable terrain and contain the configured Torch glyph in the object/character presentation layer

### Requirement: Top-most cell rendering

The Babylon Lite game layer SHALL render at most one visible glyph for each
cell. A character glyph SHALL take precedence over the terrain glyph at the
same position, and the visible glyph SHALL use the active palette style when
rendered. Empty character cells SHALL render the terrain glyph and its active
style. When both a player and a torch would otherwise target the same
position, the player glyph SHALL remain the visible character.

#### Scenario: Character hides terrain

- **WHEN** a cell contains terrain `•`, canonical water, or `W` and a character
- **THEN** the rendered cell SHALL show only the character glyph

#### Scenario: Torch hides terrain

- **WHEN** a cell contains terrain `•` or `W` and character `T`
- **THEN** the rendered cell SHALL show only `T`

#### Scenario: Empty character layer shows terrain

- **WHEN** a cell has terrain `W`, `•`, or canonical water and no character
- **THEN** the rendered cell SHALL show the terrain glyph with its configured
  style

### Requirement: Player facing glyph presentation

The player SHALL render as the palette-driven `🤺` glyph. Because the default `🤺` artwork faces left, the renderer SHALL use the unflipped glyph for left-facing presentation and a horizontally mirrored presentation for right-facing presentation. The player SHALL default to left-facing presentation, update facing only after successful left or right travel, and preserve the last horizontal facing direction during vertical travel, blocked movement, combat-only movement attempts, and realm transitions.

#### Scenario: Player starts left-facing
- **WHEN** a new game starts and the player has not traveled horizontally
- **THEN** the player SHALL render as the left-facing `🤺`

#### Scenario: Horizontal travel updates player facing
- **WHEN** the player successfully travels left or right
- **THEN** the rendered `🤺` presentation SHALL face that horizontal travel direction

#### Scenario: Vertical travel preserves player facing
- **WHEN** the player travels up or down after a previous left or right move
- **THEN** the rendered `🤺` presentation SHALL keep the last horizontal travel direction

### Requirement: Sparse organic nested water generation

The water pass SHALL make water a roughly 50% generation event by default.
When selected, it SHALL place one or two independent organic lakes, with the
first lake biased toward the center of the generated playable region so a
normal zoom-5 starting view has a meaningful chance of showing water. Each
lake SHALL target roughly 50-240 grid cells at the default world scale, with
occasional larger bodies up to roughly 480 cells. Every cell within each
selected water shape SHALL use the one canonical non-walkable water depth.

#### Scenario: Water appears in about half of default worlds

- **WHEN** a default world is generated
- **THEN** water SHALL be present in approximately half of independently
  seeded worlds

#### Scenario: Water uses one or two sparse large bodies

- **WHEN** a default world is generated
- **THEN** the world SHALL contain zero, one, or two lakes, and each selected
  lake SHALL contain roughly 50-240 water cells, with occasional bodies up to
  roughly 480 cells, except when the available cave geometry is too small

#### Scenario: A lake uses one depth

- **WHEN** a water shape is generated
- **THEN** every water cell in that shape SHALL use the canonical water depth
- **AND** every such cell SHALL have `walkable: false`

#### Scenario: Depth bands are nested

- **WHEN** a water shape is generated
- **THEN** it SHALL contain only the canonical water depth
- **AND** it SHALL contain no shallow, medium, or deep depth band

#### Scenario: Water generation is seed-stable

- **WHEN** two worlds use identical dimensions, generation parameters, and
  seed
- **THEN** their water positions, canonical depth, colors, and walkability
  SHALL match exactly

### Requirement: Player placement after water validation

The player position pass SHALL select a valid cell from the final connected
walkable region after canonical water and walkability have been derived. The
player SHALL never start in a wall or water.

#### Scenario: Player starts outside blocked water

- **WHEN** a world containing water is generated
- **THEN** the player start cell SHALL be ordinary ground and have
  `walkable: true`

### Requirement: Deterministic realm profile generation

Given the same world identity, dimensions, realm profile, object catalog, and generation parameters, a realm's terrain, player start, paired Stairs, and level-spawned object positions SHALL be repeatable.

#### Scenario: Realm object generation is repeatable
- **WHEN** the same realm inputs are generated twice
- **THEN** Hearts, Torches, Traps, and paired Stairs SHALL have identical types and positions

#### Scenario: Realm profile controls terrain result
- **WHEN** Overground and Underground are generated from the same world identity
- **THEN** each result SHALL follow its own supplied profile rather than silently reusing the other realm's terrain or feature parameters

#### Scenario: Realm generation is repeatable
- **WHEN** the same realm profile and resolved world identity are generated twice with identical dimensions and parameters
- **THEN** terrain, walkability, player start, Torches, and Stairs SHALL match

### Requirement: Dynamic entity state remains separate from terrain and static objects

The generated world SHALL retain NPCs, NPC spawners, enemies, and enemy spawners as explicit dynamic entity state associated with a realm. Their glyphs SHALL take visible precedence over terrain while preserving underlying terrain and static-object identity. No cell SHALL contain more than one player, NPC, NPC spawner, enemy, or enemy-spawner occupant.

#### Scenario: NPC moves without rewriting terrain
- **WHEN** an NPC moves from one walkable cell to another
- **THEN** both cells SHALL retain their original terrain and static-object data while dynamic occupancy changes

#### Scenario: Enemy moves without rewriting terrain
- **WHEN** an enemy moves from one walkable cell to another
- **THEN** both cells SHALL retain their original terrain and static-object data while dynamic occupancy changes

#### Scenario: Destroyed entity reveals underlying cell
- **WHEN** an enemy or spawner is removed at zero health
- **THEN** its former cell SHALL render the underlying object or terrain according to normal precedence

### Requirement: Enemy-spawner generation is seed-stable

Given the same Underground world identity, dimensions, generation parameters, object positions, and civilization layout, normal enemy-spawner positions SHALL be repeatable. The development/test bonus setting SHALL be an explicit generation input and SHALL not alter production generation when disabled.

#### Scenario: Normal spawners reproduce
- **WHEN** the same Underground inputs are generated twice with the bonus disabled
- **THEN** normal enemy-spawner counts and positions SHALL match exactly

### Requirement: Selected terrain and placement profiles
The generator SHALL apply the selected Ground, Cave / Walls, Water, and Walkability profiles when creating a realm. Player Position SHALL retain its centered baseline. The resulting realm SHALL retain its bordered, connected, valid player-start guarantees.

#### Scenario: Low player-position distribution remains valid
- **WHEN** a Low Player Position profile chooses a broad start location
- **THEN** the selected player start is within the final connected walkable region and is not blocked water or a wall

#### Scenario: Matching selected profiles remain repeatable
- **WHEN** the generator receives the same seed, dimensions, realm profile, and selected density catalog twice
- **THEN** it produces matching terrain and player positions

### Requirement: Selected world-size generation input
Before Ground generation begins, the game layer SHALL resolve the confirmed World Size selection to identical positive `rows` and `columns` for each generated realm: Low to `128 x 128`, Med to `256 x 256`, and High to `512 x 512`. The selected dimensions SHALL remain independent of browser viewport dimensions and SHALL be included with the generation inputs used for reproducibility.

#### Scenario: Generate the selected per-realm size
- **WHEN** the confirmed World Size is High
- **THEN** the generated Overground and Underground realms each contain exactly 512 rows and 512 columns before later terrain and placement passes run

#### Scenario: Preserve the Medium baseline
- **WHEN** no valid World Size selection is available
- **THEN** the generated Overground and Underground realms each contain exactly 256 rows and 256 columns

### Requirement: Overworld Buildings are generated after prerequisite object reservations
The world generator SHALL generate Overworld Buildings after player position and existing static-object reservations are available. Each accepted Building SHALL also claim exactly one valid interior chest position and create its house-owned treasure chest without rewriting natural terrain or changing the independently configured object-distribution chest count.

#### Scenario: Building pass claims a house chest
- **WHEN** an Overworld Building is accepted after prerequisite reservations are known
- **THEN** its one house-owned chest is added to the object layer at a valid interior corner and the cell is reserved against later conflicting placement

#### Scenario: Building pass preserves natural terrain
- **WHEN** a house and its chest are generated
- **THEN** the generator preserves the underlying terrain identity and uses the object/building layers for the chest and house presentation

#### Scenario: Chest distribution remains additive
- **WHEN** standalone chest generation is configured for a given density
- **THEN** that configured standalone chest count remains in addition to the guaranteed house chests

### Requirement: NPC density generation control

The Procedural Level Generation menu SHALL expose an `NPC` pass with visually clear Low, Med, and High choices. Its persisted selection SHALL default to Med and determine the Overground NPC-spawner count as 4, 8, or 12 respectively. The selected setting SHALL be used for a newly generated world and SHALL not affect Underground NPC placement.

#### Scenario: NPC setting is visible and persists
- **WHEN** a player opens the Procedural Level Generation menu and selects an NPC density
- **THEN** the `NPC` label, Low/Med/High choices, and selected choice SHALL be clearly visible, and the selection SHALL persist for the next generated world

#### Scenario: NPC density determines spawner count
- **WHEN** an Overground world is generated with Low, Med, or High NPC density
- **THEN** it SHALL contain exactly 4, 8, or 12 NPC spawners respectively

#### Scenario: NPC density is visible on the preview map
- **WHEN** the Procedural map preview shows an Overground draft with an NPC density selected
- **THEN** it SHALL overlay the matching deterministic NPC-spawner cells using a prominent marker that is at least as visible as the heart, trap, and torch preview symbols

### Requirement: Surface-scoped world graphics

Every world graphic, including terrain, objects, actors, NPCs, spawners, effects, and markers, SHALL be prepared and drawn only when its cell lies in the active surface's source region and has positive fog visibility in that surface's realm. The game view, minimap, and developer map view SHALL each use their own source region and matching fog record.

#### Scenario: Fogged NPC is not submitted
- **WHEN** an NPC or NPC spawner is outside positive fog visibility for a rendering surface
- **THEN** that surface SHALL not prepare, submit, or draw its glyph, marker, or overlay

#### Scenario: Off-region actor is not submitted
- **WHEN** an NPC, spawner, or other actor is outside a rendering surface's source region
- **THEN** that surface SHALL not prepare, submit, or draw that actor

### Requirement: NPC-spawner generation is seed-stable

Given the same Overground world identity, dimensions, generation parameters, and object positions, normal NPC-spawner positions SHALL be repeatable.

#### Scenario: Normal NPC spawners reproduce
- **WHEN** the same Overground inputs are generated twice
- **THEN** normal NPC-spawner counts and positions SHALL match exactly
