# Spec Delta

## MODIFIED Requirements

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
