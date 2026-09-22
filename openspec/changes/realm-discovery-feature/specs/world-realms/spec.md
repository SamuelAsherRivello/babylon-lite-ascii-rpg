# Spec Delta

## MODIFIED Requirements

### Requirement: Active world and realm display
The upper-right Minimap status SHALL display the active world, realm floor, and realm-local discovered percentage using the compact line `World: 1 Realm: 1 (N%)` for Overground or `World: 1 Realm: -1 (N%)` for Underground, alongside the current time. `N%` SHALL be the active realm's walkable discovery percentage. Hovering the status line SHALL expose the explanatory text `Player discovered N% of Realm X of World 1`, using the active realm value for `X`. A newly generated world SHALL still start in Overground unless the stored active-realm preference is Underground.

#### Scenario: Overground minimap status
- **WHEN** the active realm is Overground in world 1
- **THEN** the Minimap status displays `World: 1 Realm: 1 (N%)` using Overground's discovered percentage

#### Scenario: New session defaults to Overground
- **WHEN** no active-realm preference exists in local storage
- **THEN** the game starts in Overground and the Minimap status displays `World: 1 Realm: 1 (N%)` using Overground's discovered percentage

#### Scenario: Underground minimap status
- **WHEN** the active realm is Underground in world 1
- **THEN** the Minimap status displays `World: 1 Realm: -1 (N%)` using Underground's discovered percentage

#### Scenario: Discovery status hover explains the compact value
- **WHEN** the active realm is Underground in world 1 and its discovered percentage is `0%`
- **THEN** hovering the Minimap status line exposes `Player discovered 0% of Realm -1 of World 1`

#### Scenario: Stored Underground preference restores the realm
- **WHEN** the stored active-realm preference is Underground and a new world is generated after refresh
- **THEN** the player starts in Underground and the Minimap status displays `World: 1 Realm: -1 (N%)` using Underground's discovered percentage

#### Scenario: Realm transfer updates floor
- **WHEN** the player transfers between Overground and Underground
- **THEN** the Minimap status updates the realm indicator and discovered percentage to the destination realm's mapped value and walkable discovery percentage
