# fog-of-war-minimap Specification

## Purpose
Records the player's current-world exploration and presents a compact,
responsive, fog-masked view of discovered world content.

## Requirements

### Requirement: Session-scoped walkable discovery

Each newly generated world SHALL start with every cell at `0` visibility. The
game SHALL maintain a persistent per-cell visibility value from `0` through
`100` for the lifetime of that world instance: `0` SHALL mean fully fogged and
`100` SHALL mean fully unfogged. Reloading or generating a new world SHALL
reset every cell to `0`. When gameplay reveals a cell, its stored visibility
SHALL become the maximum of its existing value and the newly calculated value,
and SHALL not decrease during that world session.

#### Scenario: New world starts fogged

- **WHEN** a new world is created
- **THEN** every world cell starts with `0` persistent visibility until
  gameplay reveals it

#### Scenario: Player placement reveals nearby cells

- **WHEN** the player is placed in a new world
- **THEN** the player's current walkable cell and other eligible clear-path
  cells receive their calculated persistent visibility values

#### Scenario: Discovery retains the highest visibility

- **WHEN** a cell is first revealed at `25`, `50`, `75`, or `100` visibility
  and later receives a lower calculated visibility
- **THEN** its stored visibility remains at the prior higher value

#### Scenario: Exploration does not survive a new world

- **WHEN** the page reloads or a replacement world is generated
- **THEN** prior visibility is discarded and the replacement world starts at
  `0` visibility

### Requirement: Player-light-derived hard-line discovery

The game SHALL calculate a walkable target's newly revealed visibility only
when it lies within the active player-light profile's range and has an
unobstructed straight grid path from the player. For a clear target inside the
radius, visibility SHALL use four distance bands: `100` from the player
through `70%` of the radius, `75` through `80%`, `50` through `90%`, and `25`
through the radius boundary. The first
unwalkable cell that blocks a clear path MAY receive its distance-band
visibility for wall presentation, but unwalkable cells SHALL never contribute
to minimap walkable opacity. An intervening unwalkable cell SHALL block all
targets behind it regardless of the selected player shadow-bleed profile.

#### Scenario: Clear in-range walkable tile is discovered

- **WHEN** a walkable target lies within `70%` of the active
  radius and has a clear straight path from the player
- **THEN** the target receives a newly calculated visibility of `100`

#### Scenario: Clear targets receive stepped falloff

- **WHEN** clear walkable targets lie in the `70%–80%`, `80%–90%`, and
  `90%–100%` distance bands from the player
- **THEN** the targets receive newly calculated visibility values of `75`,
  `50`, and `25` respectively

#### Scenario: Radius edge remains partially visible

- **WHEN** a clear walkable target lies exactly on the active radius boundary
- **THEN** the target receives a newly calculated visibility of `25`

#### Scenario: Wall blocks otherwise in-range discovery

- **WHEN** a walkable target is inside the active radius but an unwalkable cell
  lies on its straight path from the player
- **THEN** the target remains at its prior persistent visibility and receives
  no new visibility from that player position

#### Scenario: Unwalkable terrain is never discovered

- **WHEN** an unwalkable terrain cell is inside the active player-light range
  but is not the first blocking cell on the clear path
- **THEN** that cell remains at `0` visibility and never contributes to
  minimap walkable opacity

### Requirement: Fog-masked world-content minimap

The minimap SHALL render each coarse world area using the average persistent
visibility of its eligible walkable cells. A fully fogged area SHALL have
`0.0` opacity, and an area whose eligible walkable cells all have `100`
visibility SHALL have `1.0` opacity. Areas with no walkable world cells SHALL
remain fully fogged. The minimap SHALL continue to render world content
without ambient, torch, player, GPU, or shadow lighting and SHALL NOT use
camera framing as its source.

#### Scenario: Partially revealed minimap area

- **WHEN** a coarse minimap area contains eligible walkable cells with mixed
  persistent visibility values
- **THEN** its world-content opacity equals the average of those values divided
  by `100`

#### Scenario: Fully explored minimap area is fully opaque

- **WHEN** every eligible walkable cell represented by a minimap area has
  `100` visibility
- **THEN** that minimap area renders its unlit world content at `1.0` opacity

#### Scenario: Fully fogged minimap area remains hidden

- **WHEN** no eligible walkable cell in a minimap area has positive persistent
  visibility
- **THEN** that area's world content remains hidden at `0.0` opacity

#### Scenario: Travel reveals world content through fog

- **WHEN** the player increases the persistent visibility of walkable cells
  while travelling through the world
- **THEN** the corresponding minimap areas display their world content with
  nonzero opacity while areas with no positive visibility remain black

### Requirement: Responsive minimap visibility

The minimap SHALL use a hard-coded minimum size and viewport-relative size so
it remains visible within the upper-right area in desktop landscape and mobile
portrait viewports. The minimap SHALL always be rendered while the HUD is
visible. Fog discovery SHALL continue independently of minimap rendering.

#### Scenario: Minimap remains rendered while discovering

- **WHEN** the player moves while the HUD is visible
- **THEN** the minimap remains rendered and eligible walkable cells continue
  to become discovered

#### Scenario: Portrait minimap remains in bounds

- **WHEN** the viewport is changed to a mobile portrait size
- **THEN** the minimap remains visible within the upper-right viewport area
  without causing page overflow
