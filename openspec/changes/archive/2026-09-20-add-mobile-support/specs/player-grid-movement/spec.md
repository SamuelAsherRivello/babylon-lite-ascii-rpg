# Spec Delta

## ADDED Requirements

### Requirement: Canvas swipe grid movement
The game SHALL accept pointer swipes that begin on unobstructed game canvas as
an alternative to keyboard movement. Crossing the gesture threshold SHALL
resolve to the nearest of eight equal-angle directions and immediately attempt
one grid-cell movement. A held swipe SHALL repeat using the existing held-key
timing: immediate movement, a second attempt after `0.25` seconds, and further
attempts every `0.125` seconds. Touch movement SHALL use the same collision,
camera, and time-advance rules as keyboard movement.

#### Scenario: Cardinal swipe
- **WHEN** a player swipes upward on unobstructed game canvas past the gesture
  threshold
- **THEN** the game immediately attempts one northward grid-cell movement

#### Scenario: Diagonal swipe hold
- **WHEN** a player swipes and holds toward a diagonal octant on unobstructed
  game canvas
- **THEN** the game immediately attempts one diagonal movement and repeats at
  the held-key cadence while the pointer remains held

#### Scenario: Gesture release
- **WHEN** a player releases or cancels an active swipe
- **THEN** touch-held movement stops without stopping an independently held
  keyboard direction

#### Scenario: Gesture interrupted by resize
- **WHEN** the browser resizes or rotates during an active swipe hold
- **THEN** the active swipe is cancelled and no stale touch repeat continues

#### Scenario: UI interaction
- **WHEN** a player starts a pointer interaction on a UI control or editor
- **THEN** the interaction performs its UI behavior and does not start player
  movement
