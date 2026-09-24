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
walkable ground, `~` for walkable shallow water, `≈` for non-walkable medium
water, and `▓` for non-walkable deep water. The outermost row and column SHALL
remain walls. After cave and water generation, the final walkable region SHALL
be connected and meet the configured minimum walkable-area requirement.

#### Scenario: Outer border is non-walkable

- **WHEN** a world is generated
- **THEN** every cell in the outermost row and column SHALL be `W` and have
  `walkable: false`

#### Scenario: Water depth controls traversal

- **WHEN** a generated terrain cell contains `~`
- **THEN** the cell SHALL be walkable

#### Scenario: Deeper water blocks traversal

- **WHEN** a generated terrain cell contains `≈` or `▓`
- **THEN** the cell SHALL be non-walkable

#### Scenario: Final playable region is connected

- **WHEN** a generated world is accepted
- **THEN** the final ground and shallow-water cells used for movement SHALL
  form one connected region large enough to contain the player start cell

#### Scenario: Player region is connected

- **WHEN** a generated world is accepted
- **THEN** its final playable region SHALL consist of one connected walkable
  area large enough to contain the player start cell

### Requirement: Layered world data

The Babylon Lite game layer SHALL retain level-spawned objects and
Underground civilization features in explicit layers associated with the
terrain and character layers. Object and civilization glyphs SHALL take
visible precedence over terrain while preserving underlying natural terrain
identity. Torch, Trap, Heart, and Stair objects SHALL not make their cells
non-walkable; fences and closed doors SHALL block effective movement, while
open doors SHALL be walkable.

#### Scenario: Walkable object occupies natural terrain
- **WHEN** a Heart, Torch, Trap, or Stair is placed in a valid generated world
- **THEN** its cell SHALL retain the underlying walkable terrain and expose the
  object through the object layer

#### Scenario: Object occupies a walkable terrain cell
- **WHEN** a level-spawned object is placed
- **THEN** its cell SHALL retain the underlying walkable terrain and expose the
  object through the object layer

#### Scenario: Barrier occupies natural terrain
- **WHEN** a fence or closed door is placed in an Underground opening
- **THEN** the underlying natural terrain SHALL remain available while the
  civilization layer marks the cell as blocked for movement

#### Scenario: Open door preserves walkability
- **WHEN** a closed door changes to its open state
- **THEN** the open door SHALL remain rendered above the natural terrain and
  its cell SHALL become walkable

#### Scenario: Object is rendered above terrain
- **WHEN** an undiscovered or discovered cell contains a visible object or
  civilization glyph
- **THEN** the active topmost glyph SHALL render above the terrain glyph using
  its palette style

#### Scenario: Player occupies a walkable terrain cell
- **WHEN** the player is placed at a valid start cell
- **THEN** that cell SHALL retain its walkable terrain in the terrain layer and
  contain `🤺` in the character layer

#### Scenario: Water retains terrain identity under a character
- **WHEN** a character occupies a shallow-water cell
- **THEN** the visible character SHALL render while the underlying water glyph,
  depth, and walkability remain available in the terrain layer

#### Scenario: Torch occupies a walkable terrain cell
- **WHEN** a Torch is placed in a valid generated world
- **THEN** that cell SHALL retain its underlying walkable terrain and contain
  the configured Torch glyph in the object/character presentation layer

### Requirement: Top-most cell rendering

The Babylon Lite game layer SHALL render at most one visible glyph for each
cell. A character glyph SHALL take precedence over the terrain glyph at the
same position, and the visible glyph SHALL use the active palette style when
rendered. Empty character cells SHALL render the terrain glyph and its active
style. When both a player and a torch would otherwise target the same
position, the player glyph SHALL remain the visible character.

#### Scenario: Character hides terrain

- **WHEN** a cell contains terrain `•`, `~`, `≈`, or `▓` and a character
- **THEN** the rendered cell SHALL show only the character glyph

#### Scenario: Torch hides terrain

- **WHEN** a cell contains terrain `•` or `W` and character `T`
- **THEN** the rendered cell SHALL show only `T`

#### Scenario: Empty character layer shows terrain

- **WHEN** a cell has terrain `W`, `•`, `~`, `≈`, or `▓` and no character
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

The water pass SHALL make water a roughly 50% generation event by default. When
selected, it SHALL place one or two independent organic lakes, with the first
lake biased toward the center of the generated playable region so a normal
zoom-5 starting view has a meaningful chance of showing water. Each lake SHALL
target roughly 50-240 grid cells at the default world scale, with occasional
larger bodies up to roughly 480 cells. Within each water shape, the
deepest cells SHALL occupy the center, medium-depth cells SHALL wrap the deep
cells, and shallow cells SHALL form the outer water edge.

#### Scenario: Water appears in about half of default worlds

- **WHEN** a default world is generated
- **THEN** water SHALL be present in approximately half of independently
  seeded worlds

#### Scenario: Water uses one or two sparse large bodies

- **WHEN** a default world is generated
- **THEN** the world SHALL contain zero, one, or two lakes, and each selected
  lake SHALL contain roughly 50-240 water cells, with occasional bodies up to
  roughly 480 cells, except when the available cave geometry is too small

#### Scenario: Depth bands are nested

- **WHEN** a water shape contains all three depth levels
- **THEN** every deep cell SHALL be enclosed by the medium band and every
  medium cell SHALL be enclosed by or adjacent toward the outside to shallow
  water, subject to the organic boundary

#### Scenario: Water generation is seed-stable

- **WHEN** two worlds use identical dimensions, generation parameters, and
  seed
- **THEN** their water positions, depth glyphs, colors, and walkability SHALL
  match exactly

### Requirement: Player placement after water validation

The player position pass SHALL select a valid cell from the final connected
walkable region after water depth and walkability have been derived. The player
SHALL never start in a wall, medium water, or deep water.

#### Scenario: Player starts outside blocked water

- **WHEN** a world containing water is generated
- **THEN** the player start cell SHALL be ordinary ground or shallow water and
  SHALL have `walkable: true`

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

The generated world SHALL retain enemies and enemy spawners as explicit dynamic entity state associated with a realm. Their glyphs SHALL take visible precedence over terrain while preserving underlying terrain and static-object identity. No cell SHALL contain more than one player, enemy, or spawner occupant.

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
