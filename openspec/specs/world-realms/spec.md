# world-realms Specification

## Purpose
Defines a two-realm generated world so exploration can cross synchronized
Overground and Underground maps without sharing temporary realm state.

## Requirements

### Requirement: Default world contains two named realms
Each newly generated world SHALL contain exactly an `Overground` realm and an
`Underground` realm. The game SHALL maintain one active world and one active
realm at a time, and gameplay rendering, movement, lighting, minimap, and
discovery SHALL use only that active realm.

#### Scenario: New game starts in one active realm
- **WHEN** a new world is ready for play
- **THEN** it contains Overground and Underground and the player occupies one
  valid start cell in exactly one active realm

#### Scenario: Inactive realm does not render
- **WHEN** the player is active in Overground
- **THEN** Underground terrain, characters, lighting, and minimap content are
  not rendered as part of the active game view

### Requirement: Active world and realm display
The upper-left UI SHALL display `World: 1`, then `Realm: Overground` or
`Realm: Underground`, then the time display according to the active realm. A
newly generated world SHALL start in Overground unless the
stored active-realm preference is Underground.

#### Scenario: New session defaults to Overground
- **WHEN** no active-realm preference exists in local storage
- **THEN** the game starts in Overground and the upper-left UI displays
  `World: 1`, `Realm: Overground`, and then the time

#### Scenario: Stored Underground preference restores the realm
- **WHEN** the stored active-realm preference is Underground and a new world
  is generated after refresh
- **THEN** the player starts in Underground and the upper-left UI displays
  `World: 1`, `Realm: Underground`, and then the time

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
Each world SHALL generate non-blocking `S` stairs in both realms at the same
grid coordinates. The requested stair count SHALL equal the requested torch
count, subject to valid placement capacity. Every accepted paired coordinate
SHALL be walkable and reachable in both realms, SHALL not be either realm's
player start, and SHALL remain deterministic for the same world identity and
generation parameters.

#### Scenario: Stairs match across realms
- **WHEN** a generated world's stair coordinates are inspected
- **THEN** each Overground `S` has an Underground `S` at the identical
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

### Requirement: Realm settings transfer
The Settings UI SHALL display `Realm (Overground)` or `Realm (Underground)`
for the active realm. Activating it SHALL select the stairs with the shortest
reachable walking-path distance, move the player to those stairs, and transfer
to the paired realm. Each walkable cell on the selected route SHALL be
discovered in the source realm before transfer. The selected realm SHALL be
persisted and generated first after refresh.

#### Scenario: Settings transfer uses reachable stairs
- **WHEN** the player activates Realm while in Overground
- **THEN** the game uses the shortest walkable path to an `S` cell and arrives
  in Underground at the paired `S` coordinate, with every route cell retained
  as discovered in Overground
