# Spec Delta

## ADDED Requirements

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

