# Spec Delta

## Purpose

Records the player's current-world exploration and presents a compact,
responsive, fog-masked view of discovered world content.

## ADDED Requirements

### Requirement: Session-scoped walkable discovery

Each newly generated world SHALL start with every cell fogged. The game SHALL
maintain discovery only for the lifetime of that world instance: reloading or
generating a new world SHALL start fully fogged again. The player's current
walkable cell SHALL become discovered when the player is placed, and a
discovered cell SHALL not return to fogged during that world session.

#### Scenario: New world starts fogged

- **WHEN** a new world is created
- **THEN** no world cell other than cells revealed from the placed player is
  discovered

#### Scenario: Exploration does not survive a new world

- **WHEN** the page reloads or a replacement world is generated
- **THEN** prior discovery is discarded and the replacement world starts
  fogged

### Requirement: Player-light-derived hard-line discovery

The game SHALL discover a walkable target only when it lies within the active
player-light profile's range and falloff and has an unobstructed straight grid
path from the player. An unwalkable target SHALL remain fogged, and an
intervening unwalkable cell SHALL block discovery regardless of the selected
player shadow-bleed profile. Changing torch lighting, ambient lighting, or
the minimap visibility SHALL not discover cells.

#### Scenario: Clear in-range walkable tile is discovered

- **WHEN** a walkable target lies within the active player-light discovery
  range and has a clear straight path from the player
- **THEN** the target becomes discovered

#### Scenario: Wall blocks otherwise in-range discovery

- **WHEN** a walkable target is within the active player-light discovery
  range but an unwalkable cell lies on its straight path from the player
- **THEN** the target remains fogged

#### Scenario: Unwalkable terrain is never discovered

- **WHEN** an unwalkable terrain cell is inside the active player-light
  discovery range
- **THEN** that terrain cell remains fogged

### Requirement: Fog-masked world-content minimap

The game SHALL present a minimap in the upper-right viewport area that renders
downsampled world content. The initial hard-coded scale SHALL map each minimap
cell to a 10 by 10 world-cell area. Each minimap area's fog opacity SHALL
equal the fraction of its walkable world cells that are discovered: fully
fogged areas SHALL have `0.0` opacity and fully visited areas SHALL have `1.0`
opacity. Areas with no walkable world cells SHALL remain fully fogged. The
minimap SHALL render its world content without ambient, torch, player, GPU, or
shadow lighting and SHALL NOT use camera framing as its source.

#### Scenario: Travel reveals world content through fog

- **WHEN** the player discovers walkable cells while travelling through the
  world
- **THEN** the corresponding minimap areas display their world content with
  nonzero fog opacity while undiscovered areas remain black

#### Scenario: Fully explored minimap area is fully opaque

- **WHEN** every walkable world cell represented by a minimap area is
  discovered
- **THEN** that minimap area renders its unlit world content at `1.0` opacity

### Requirement: Responsive minimap visibility

The minimap SHALL use a hard-coded minimum size and viewport-relative size so
it remains visible within the upper-right area in desktop landscape and mobile
portrait viewports. The Settings UI SHALL provide a persisted checkbox labeled
`Minimap`, enabled by default, that controls whether the minimap is rendered.
Fog discovery SHALL continue while the minimap is disabled, and Reset Settings
SHALL restore the enabled default.

#### Scenario: Hidden minimap keeps discovering

- **WHEN** the user disables `Minimap` and moves the player
- **THEN** no minimap is rendered and eligible walkable cells continue to
  become discovered

#### Scenario: Re-enabled minimap shows prior discovery

- **WHEN** the user re-enables `Minimap` during the same world session
- **THEN** the minimap immediately displays all coverage discovered while it
  was hidden

#### Scenario: Portrait minimap remains in bounds

- **WHEN** the viewport is changed to a mobile portrait size
- **THEN** the minimap remains visible within the upper-right viewport area
  without causing page overflow
