# Spec Delta

## MODIFIED Requirements

### Requirement: Game systems can submit log events

The game layer SHALL provide a Log System that accepts log events from independent gameplay systems through a shared event contract. An event SHALL contain a message value that can be rendered as one log line. Opening a Treasure Chest SHALL submit a visible chest-opening log immediately during the opening interaction, and collecting its spawned Heart SHALL submit a visible Heart-collection log during pickup collision.

#### Scenario: Gameplay system submits an event
- **WHEN** a displayable gameplay event with a message is submitted
- **THEN** the Log System appends one ordered line to the log history

#### Scenario: Event is not displayable
- **WHEN** a gameplay event is rejected by the display policy or has no usable message
- **THEN** no visible log line is created

#### Scenario: Chest opening appears in the visible Log UI
- **WHEN** the player opens an unopened Treasure Chest
- **THEN** the Log System and bridge snapshot contain a chest-opening line before or alongside the newly rendered Heart

#### Scenario: Heart collection appears in the visible Log UI
- **WHEN** the player walks into the Heart spawned by that chest
- **THEN** the Heart effect is applied once and the Log System and bridge snapshot contain the Heart-collection line

#### Scenario: Repeated chest contact does not duplicate opening output
- **WHEN** the player contacts the same opened chest again
- **THEN** no additional chest-opening log or Heart is created
