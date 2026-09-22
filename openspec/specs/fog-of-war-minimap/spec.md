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

### Requirement: Realm-specific starting fog clear footprint

When a newly generated realm is initialized for play, the game SHALL perform
one additional fog reveal centered on that realm's player-start cell before
normal movement discovery begins. The reveal footprint SHALL be derived from
the logical game viewport at displayed zoom `5`, shall use independent X and Y
dimensions, and shall be clamped to the world bounds. The Overground footprint
SHALL cover `95%` of the zoom-5 viewport width and `95%` of its height; the
Underground footprint SHALL cover `60%` of the zoom-5 viewport width and `60%`
of its height. The reveal SHALL use the existing walkability, clear-path, and
persistent maximum-visibility rules, and SHALL not alter the realm's ordinary
movement discovery radius.

#### Scenario: Overground starts with a wide clear footprint

- **WHEN** a newly generated Overground realm becomes active at game start
- **THEN** eligible clear-path walkable cells inside the player-centered
  footprint covering `95%` of the zoom-5 viewport width and height receive
  their calculated fog visibility before the first movement input

#### Scenario: Underground starts with a smaller clear footprint

- **WHEN** a newly generated Underground realm becomes active at game start
- **THEN** eligible clear-path walkable cells inside the player-centered
  footprint covering `60%` of the zoom-5 viewport width and height receive
  their calculated fog visibility before the first movement input

#### Scenario: Starting footprint uses separate axes

- **WHEN** the zoom-5 logical viewport has different column and row counts
- **THEN** the starting reveal SHALL resolve its horizontal and vertical
  extents independently rather than using one shared circular radius

#### Scenario: Starting footprint is bounded by the world

- **WHEN** the player-start cell is near a generated-world edge or the
  viewport-sized footprint exceeds the world dimensions
- **THEN** the starting reveal SHALL inspect only in-bounds cells and SHALL
  not synthesize or reveal cells outside the active realm

#### Scenario: Movement discovery remains additive

- **WHEN** the player moves after the starting reveal has completed
- **THEN** the existing realm-specific movement radius, line-of-sight,
  visibility falloff, and maximum-ever persistence rules SHALL continue to
  apply without being replaced by the starting footprint

#### Scenario: Realm starting reveals remain isolated

- **WHEN** a world contains both Overground and Underground realms
- **THEN** initializing one realm's starting footprint SHALL not reveal cells
  in the other realm's fog record

### Requirement: Realm-local walkable discovery percentage

The game SHALL calculate a discovery percentage for the active realm using only that realm's walkable tiles. A walkable tile SHALL count as discovered when its persistent fog visibility is greater than `0`. The percentage SHALL equal discovered walkable tiles divided by total walkable tiles in the active realm, expressed as a whole percentage from `0%` through `100%`. Unwalkable tiles SHALL NOT contribute to the numerator or denominator. The percentage SHALL reset with a newly generated world and SHALL remain isolated per realm.

#### Scenario: New realm starts with no discovered walkable tiles

- **WHEN** an active realm has walkable tiles and none have positive persistent fog visibility
- **THEN** the active realm's discovery percentage is `0%`

#### Scenario: Partially discovered realm reports walkable coverage

- **WHEN** some but not all walkable tiles in the active realm have positive persistent fog visibility
- **THEN** the active realm's discovery percentage reflects only those discovered walkable tiles divided by the active realm's total walkable tiles

#### Scenario: Unwalkable tiles do not affect discovery percentage

- **WHEN** an unwalkable tile has fog visibility or remains fogged
- **THEN** that tile does not change the active realm's discovery percentage

#### Scenario: Realm discovery percentages remain isolated

- **WHEN** the player discovers walkable tiles in Overground and then transfers to Underground
- **THEN** Underground reports only its own discovered walkable coverage and Overground's percentage is restored when the player returns

#### Scenario: Fully discovered realm reports complete coverage

- **WHEN** every walkable tile in the active realm has positive persistent fog visibility
- **THEN** the active realm's discovery percentage is `100%`
