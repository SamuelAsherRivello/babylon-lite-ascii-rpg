# Spec Delta

## Purpose

Defines a two-realm generated world so exploration can cross synchronized
Overground and Underground maps without sharing temporary realm state.

## ADDED Requirements

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

### Requirement: Realm-scoped fog of war
Each realm SHALL own a separate fog-of-war record for the lifetime of its
world. Discovery in one realm SHALL not reveal cells in the other realm, and
realm transfer SHALL restore the destination realm's previous discovery.

#### Scenario: Discovery remains isolated
- **WHEN** the player discovers cells in Overground and then transfers to
  Underground
- **THEN** Underground starts with only its own discovered cells and
  Overground discovery remains available when the player returns

### Requirement: Realm restart controls
The upper-left UI SHALL display `Restart Overground` and `Restart Underground`
beneath the project title and time. Activating a restart control SHALL replace
only the named realm with a newly generated valid realm, clear only its fog,
and make that replacement realm the active realm at its valid player start.

#### Scenario: Restart preserves the other realm
- **WHEN** the player activates `Restart Underground`
- **THEN** a fresh Underground realm and fog replace the prior Underground,
  the player enters it at its valid start, and existing Overground terrain and
  discovery remain unchanged
