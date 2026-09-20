# Spec Delta

## MODIFIED Requirements

### Requirement: World time is displayed in the upper-left corner
The UI SHALL display the label `Time:` inside the upper-right Minimap box and SHALL render the current world time as a four-digit, zero-padded number for values below `10000`. The time value SHALL continue to reflect the active world-time system and SHALL update after successful movement.

#### Scenario: Initial minimap-box time display
- **WHEN** a new game view is shown with world time `1`
- **THEN** the Minimap box displays `Time: 0001`

#### Scenario: Initial time display
- **WHEN** a new game view is shown
- **THEN** the Minimap box displays `Time: 0001`

#### Scenario: Updated minimap-box time display
- **WHEN** world time advances
- **THEN** the `Time:` value inside the Minimap box updates to the current four-digit zero-padded value

#### Scenario: Updated time display
- **WHEN** world time advances
- **THEN** the UI updates to the new four-digit zero-padded value inside the Minimap box

#### Scenario: Values beyond four digits
- **WHEN** world time reaches a value greater than `9999`
- **THEN** the UI displays the complete numeric value without truncation

#### Scenario: Values beyond five digits
- **WHEN** world time reaches a value greater than `99999`
- **THEN** the Minimap box displays the complete numeric value without truncation
