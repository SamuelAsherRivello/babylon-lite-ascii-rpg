# Spec Delta

## ADDED Requirements

### Requirement: Camera-independent startup placement

Before the first visible world render after a game restart, the game SHALL
position the player's cell at the dead center of the visible viewport whenever
the generated world has sufficient space. This startup placement SHALL be the
same for Camera Center, Camera Deadzone, and Camera Lock; the selected camera
mode SHALL control movement behavior only after startup placement is complete.
At a world boundary, the viewport origin SHALL clamp to the valid world range
while the player remains on its actual generated start cell.

#### Scenario: Center mode starts centered

- **WHEN** the game restarts with Camera Center selected
- **THEN** the first visible world render places the player in the viewport's
  center cell

#### Scenario: Deadzone mode starts centered

- **WHEN** the game restarts with Camera Deadzone selected
- **THEN** the first visible world render places the player in the viewport's
  center cell before deadzone movement behavior begins

#### Scenario: Lock mode starts centered

- **WHEN** the game restarts with Camera Lock selected
- **THEN** the first visible world render places the player in the viewport's
  center cell before lock/wrap movement behavior begins

#### Scenario: Startup placement does not change the world cell

- **WHEN** the game restarts in any supported camera mode
- **THEN** the player's world x/y cell equals the generated start cell
- **AND** one valid movement input changes exactly one corresponding world
  coordinate by one cell
