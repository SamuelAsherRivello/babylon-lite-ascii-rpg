# Spec Delta

## MODIFIED Requirements

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
