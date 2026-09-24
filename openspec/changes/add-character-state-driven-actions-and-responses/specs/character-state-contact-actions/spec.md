# Spec Delta

## Purpose

Defines how character equipment, resources, and intrinsic state determine one response to a normalized world-contact event.

## ADDED Requirements

### Requirement: Character state provides ordered contact capabilities

The player character SHALL expose four ordered equipment slots, resources, and an intrinsic body capability as candidate responders to a contact target. The default state for every new game or regenerated world SHALL equip `🗡` Sword in Slot 01, `🛡` Shield in Slot 02, `⛏` Pickaxe in Slot 03, and leave Slot 04 empty. For each contact, capable equipment slots SHALL be considered in ascending slot order, then applicable resources, then the body; the first capable response SHALL be the only response resolved for that contact.

#### Scenario: Default equipment responds in slot order

- **WHEN** a newly created player contacts a target that Sword can handle
- **THEN** Sword handles the contact before later slots, resources, or body

#### Scenario: Earlier non-capable slot permits a later response

- **WHEN** the player contacts an eligible mountain with the default loadout
- **THEN** Sword and Shield decline the contact and Pickaxe resolves it

### Requirement: Contact targets are normalized and cardinally adjacent

The game SHALL normalize contactable dynamic occupants, persistent objects, and eligible terrain into contact targets before requesting a character-state response. In this change, player-initiated contact targets SHALL be limited to the immediately adjacent north, south, east, or west cell; diagonal movement SHALL not resolve a contact action. The contact-target contract SHALL not prevent a future change from acquiring a target at a longer range.

#### Scenario: Cardinal input produces a contact target

- **WHEN** a player attempts to enter an eligible adjacent enemy, closed door, closed chest, or diggable mountain
- **THEN** the destination is offered as one normalized contact target

#### Scenario: Diagonal input does not produce a contact action

- **WHEN** a player attempts diagonal movement into an enemy, enemy spawner, closed door, closed chest, or diggable mountain
- **THEN** no character-state contact response resolves

### Requirement: Initial capabilities define their applicable outcomes

Sword SHALL respond to enemy and enemy-spawner targets, Pickaxe SHALL respond to eligible interior mountains, Keys SHALL respond to a closed door only when at least one key is available, and the body SHALL respond to a closed treasure chest. Shield SHALL respond to an incoming enemy attack; when Shield is absent or cannot respond, the body SHALL receive the incoming damage. Gold SHALL not provide an initial contact response.

#### Scenario: Key resource opens a door

- **WHEN** the player has at least one Key resource and contacts a closed door
- **THEN** Keys provides the one door-opening response and one key is spent

#### Scenario: Body opens a chest

- **WHEN** the player contacts a closed Treasure Chest with the default state
- **THEN** the body provides the one chest-opening response without consuming equipment or a resource

#### Scenario: Body receives an unshielded enemy attack

- **WHEN** an enemy attacks a player without a Shield response
- **THEN** the body receives the enemy's full configured damage

### Requirement: Contact resolution consumes exactly one turn

A handled contact SHALL leave the player in the origin cell, even if the target is removed or becomes walkable. A contact target with no capable response SHALL also leave the player in the origin cell, advance exactly one normal movement tick, and recover the normal capped movement stamina amount; it SHALL not change the target, equipment, Gold, or Keys. A later input SHALL be required to enter a destination made available by a prior response.

#### Scenario: Unarmed enemy contact advances a normal movement turn

- **WHEN** a player without a Sword contacts an adjacent enemy
- **THEN** the player and enemy remain in place, world time advances once, and normal movement stamina recovery occurs without damaging the enemy

#### Scenario: Cleared target requires later movement

- **WHEN** one Sword or Pickaxe response removes its target
- **THEN** the player remains in the origin cell until a later cardinal input

### Requirement: Incoming NPC contact is safe and extensible

An NPC contact directed at the player SHALL use the same contact-target and character-state response contract as other incoming contacts. The initial NPC contact behavior SHALL be non-damaging and remain unhandled unless a future character-state capability explicitly responds.

#### Scenario: NPC contact does not damage the default player

- **WHEN** an NPC contacts the player with the default character state
- **THEN** the player takes no damage and no current equipment or resource is consumed
