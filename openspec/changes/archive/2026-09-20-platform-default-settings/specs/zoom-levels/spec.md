# Spec Delta

## MODIFIED Requirements

### Requirement: Bounded zoom control

The Settings UI SHALL expose a `Zoom + N -` control whose value starts at `5`
on PC and `7` on Mobile when no saved zoom value exists, and SHALL remain
between `1` and `10`, inclusive. A saved valid zoom value SHALL take precedence
over the platform default. Increasing the value SHALL make glyph cells larger
and decreasing the value SHALL make glyph cells smaller.

#### Scenario: Default zoom value

- **WHEN** a new PC game view is shown with no saved zoom value
- **THEN** the Settings UI SHALL display `Zoom + 5 -`

#### Scenario: Default Mobile zoom value

- **WHEN** a new Mobile game view is shown with no saved zoom value
- **THEN** the Settings UI SHALL display `Zoom + 7 -`

#### Scenario: Saved zoom value

- **WHEN** a game view is shown with a saved valid zoom value
- **THEN** the Settings UI SHALL display the saved value regardless of platform

#### Scenario: Zoom in

- **WHEN** the user activates the plus control while the value is below `10`
- **THEN** the value SHALL increase by one and the visible glyph cells SHALL
  become larger

#### Scenario: Zoom out

- **WHEN** the user activates the minus control while the value is above `1`
- **THEN** the value SHALL decrease by one and the visible glyph cells SHALL
  become smaller

#### Scenario: Zoom bounds

- **WHEN** the user activates plus at `10` or minus at `1`
- **THEN** the value SHALL remain unchanged and SHALL NOT leave the range
  `1` through `10`
