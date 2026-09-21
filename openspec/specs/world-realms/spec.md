# world-realms Specification

## Purpose
Defines a two-realm generated world so exploration can cross synchronized
Overground and Underground maps without sharing temporary realm state.

## Requirements

### Requirement: Default world contains two named realms
Each newly generated world SHALL contain exactly an `Overground` realm and an
`Underground` realm. The game SHALL maintain one active world and one active
realm at a time, and gameplay rendering, movement, lighting, minimap, and
discovery SHALL use only that active realm. The active realm SHALL contain
exactly one rendered player marker, located at the authoritative player
position; a realm's generated start cell SHALL NOT remain visible as an
additional player marker after the player arrives elsewhere.

#### Scenario: New game starts in one active realm
- **WHEN** a new world is ready for play
- **THEN** it contains Overground and Underground and the player occupies one
  valid start cell in exactly one active realm, with exactly one rendered
  player marker

#### Scenario: Inactive realm does not render
- **WHEN** the player is active in Overground
- **THEN** Underground terrain, characters, lighting, and minimap content are
  not rendered as part of the active game view

#### Scenario: Destination start marker is not duplicated
- **WHEN** the player transfers to the paired stair in the other realm
- **THEN** the destination active realm renders exactly one player marker at
  the paired arrival cell and does not render its generated start-cell marker

#### Scenario: Returning to a realm preserves one controllable player
- **WHEN** the player transfers between realms repeatedly
- **THEN** the active realm renders exactly one player marker at the current
  controllable player position after every transfer

### Requirement: Active world and realm display
The upper-right Minimap box SHALL display the active world and floor using the compact labels `W: 1` and `F: 1` for Overground or `F: -1` for Underground, alongside the current time. A newly generated world SHALL still start in Overground unless the stored active-realm preference is Underground.

#### Scenario: Overground minimap status
- **WHEN** the active realm is Overground in world 1
- **THEN** the Minimap box displays `W: 1` and `F: 1`

#### Scenario: New session defaults to Overground
- **WHEN** no active-realm preference exists in local storage
- **THEN** the game starts in Overground and the Minimap box displays `W: 1` and `F: 1`

#### Scenario: Underground minimap status
- **WHEN** the active realm is Underground in world 1
- **THEN** the Minimap box displays `W: 1` and `F: -1`

#### Scenario: Stored Underground preference restores the realm
- **WHEN** the stored active-realm preference is Underground and a new world is generated after refresh
- **THEN** the player starts in Underground and the Minimap box displays `W: 1` and `F: -1`

#### Scenario: Realm transfer updates floor
- **WHEN** the player transfers between Overground and Underground
- **THEN** the Minimap box updates the floor indicator to the destination realm's mapped value

### Requirement: Realm-specific terrain profiles
Overground SHALL use walkable grass as its default terrain and non-walkable
`M` mountains as its default blocked terrain. Underground SHALL use walkable
dirt as its default terrain and non-walkable `W` walls as its default blocked
terrain. Each realm SHALL use its own fixed generation profile, including
feature occurrence probabilities and parameters.

#### Scenario: Realm terrain is distinguishable
- **WHEN** both realms of a world are generated
- **THEN** their default walkable and blocked terrain identities follow their
  respective profiles and mountains and walls remain non-walkable

### Requirement: Synchronized paired stairs
Each world SHALL generate non-blocking `▤` stairs in both realms at the same
grid coordinates. The requested stair count SHALL equal the requested torch
count, subject to valid placement capacity. Every accepted paired coordinate
SHALL be walkable and reachable in both realms, SHALL not be either realm's
player start, and SHALL remain deterministic for the same world identity and
generation parameters.

#### Scenario: Stairs match across realms
- **WHEN** a generated world's stair coordinates are inspected
- **THEN** each Overground `▤` has an Underground `▤` at the identical
  coordinate and both underlying terrain cells are walkable

#### Scenario: Entering stairs transfers realms once
- **WHEN** the player successfully enters an `S` cell
- **THEN** the active realm changes to its paired realm and the player arrives
  on the paired `S` coordinate without immediately transferring back

#### Scenario: Entering Underground persists active realm
- **WHEN** the player enters Overground stairs and transfers to Underground
- **THEN** Underground becomes the stored active-realm preference for the
  next refresh

### Requirement: Realm-scoped fog of war
Each realm SHALL own a separate fog-of-war record for the lifetime of its
world. Discovery in one realm SHALL not reveal cells in the other realm, and
realm transfer SHALL restore the destination realm's previous discovery.

#### Scenario: Discovery remains isolated
- **WHEN** the player discovers cells in Overground and then transfers to
  Underground
- **THEN** Underground starts with only its own discovered cells and
  Overground discovery remains available when the player returns

### Requirement: Realm transfer remains gameplay-owned
The game SHALL transfer to the paired realm when the player enters the stairs,
selecting the shortest reachable walking-path distance. Each walkable cell on
the selected route SHALL be
discovered in the source realm before transfer. The selected realm SHALL be
persisted and generated first after refresh.

#### Scenario: Stair transfer uses reachable stairs
- **WHEN** the player enters the stairs while in Overground
- **THEN** the game uses the shortest walkable path to an `S` cell and arrives
  in Underground at the paired `S` coordinate, with every route cell retained
  as discovered in Overground

### Requirement: Realm entry events

The realm system SHALL emit a generic immutable realm-entry event whenever a
game instance establishes or changes its active realm. The event SHALL identify
the entered realm and SHALL be available to gameplay consumers without exposing
realm cells, fog data, or transition internals.

#### Scenario: Initial Overground realm is observable

- **WHEN** a new game instance is initialized with Overground active
- **THEN** the realm system SHALL emit a realm-entry event identifying Overground

#### Scenario: Initial Underground realm is observable

- **WHEN** a new game instance is initialized with Underground active
- **THEN** the realm system SHALL emit a realm-entry event identifying Underground

#### Scenario: Stair transfer is observable

- **WHEN** the player transfers from one realm through paired stairs
- **THEN** the realm system SHALL emit one realm-entry event identifying the destination realm after the destination becomes active

#### Scenario: Realm event has no quest ownership

- **WHEN** a realm-entry event is emitted
- **THEN** the realm system SHALL publish only the generic realm fact and SHALL not inspect quest definitions, spawn gold, or update quest progress

### Requirement: Covered realm transfer presentation

When a player transfers between paired realms, the destination realm SHALL be
prepared and presented while the transition remains fully covered. The opening
phase SHALL begin only after the destination game view is ready to display, so
no empty, detached, or partially initialized game view is observable between
realms.

#### Scenario: Stair transfer opens directly onto the destination realm

- **WHEN** the player enters a paired stair and the closing iris reaches full
  coverage
- **THEN** the destination realm SHALL be active and its visible game frame
  SHALL be ready before the iris begins opening

#### Scenario: Settings transfer opens directly onto the destination realm

- **WHEN** a named realm transfer is requested through the existing Settings
  command and the closing iris reaches full coverage
- **THEN** the destination realm SHALL be active and its visible game frame
  SHALL be ready before the iris begins opening

#### Scenario: Transfer has no intermediate blank frame

- **WHEN** the destination frame is revealed at the covered-to-opening
  boundary
- **THEN** the player SHALL see either the fully covered transition surface or
  the rendered destination realm, and SHALL not see a blank or missing game
  layer for a display frame
