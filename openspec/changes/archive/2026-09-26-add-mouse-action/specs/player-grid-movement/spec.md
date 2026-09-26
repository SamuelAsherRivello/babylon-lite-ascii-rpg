# Spec Delta

## ADDED Requirements

### Requirement: Movement inputs use one player action resolution path

The game SHALL resolve each direction from WASD, arrow keys, canvas swipes, and mouse automatic navigation through one player movement-and-contact path. That path SHALL decide whether the exact attempted destination produces a successful movement, an available contact action, or a denied attempt before any player state changes. A directional contact action SHALL preserve the existing target-specific outcomes for time, stamina, equipment, damage, experience, rendering, and player position regardless of its input source. Mouse automatic navigation SHALL generate only cardinal directions; keyboard and swipe input SHALL retain their existing diagonal behavior. Space SHALL remain the bomb action input and SHALL resolve through the same centralized player-action boundary using the current cardinal heading.

#### Scenario: Equivalent cardinal inputs share an enemy action
- **WHEN** a keyboard, arrow-key, swipe, or mouse-generated cardinal direction targets the same adjacent living enemy under the same player state
- **THEN** each input resolves the same ordinary player attack outcome without moving the player into the enemy cell

#### Scenario: Equivalent cardinal inputs share mountain digging
- **WHEN** a keyboard, arrow-key, swipe, or mouse-generated cardinal direction targets the same adjacent interior Overground mountain while the player has a Pickaxe
- **THEN** each input resolves the same ordinary mountain-dig outcome without moving the player on that action

#### Scenario: Capability removal denies every input source
- **WHEN** the player lacks the capability required to act on an adjacent blocked target, such as a Pickaxe for an interior Overground mountain
- **THEN** every movement input source leaves the player in place and performs no target action

#### Scenario: Space keeps heading-based bomb behavior
- **WHEN** the player presses Space with a valid current cardinal heading and an available bomb
- **THEN** the existing bomb action resolves at the heading location without treating the Space key as a movement direction
