# Spec Delta

## Purpose

Provides one consistent, easing-aware animation contract for application-owned
client animations, while making the Anime.js easing catalog available to
current and future Babylon Lite animations. The realm iris transition is the
first required consumer of this contract.

## ADDED Requirements

### Requirement: Shared animation helper contract

Application-owned JavaScript animations SHALL be startable through a shared
animation helper that accepts a duration, normalized progress callback, and an
optional easing selection. The helper SHALL support completion and cancellation
without leaving a scheduled update active.

#### Scenario: Linear animation reaches its endpoint

- **WHEN** an animation runs with a positive duration and no explicit easing
- **THEN** progress advances from `0` to `1`, the callback receives the eased
  progress on each update, and the final update is exactly `1`

#### Scenario: Animation can be cancelled

- **WHEN** an active animation is cancelled before its duration elapses
- **THEN** no later update or completion callback is emitted for that animation

#### Scenario: Invalid duration is rejected

- **WHEN** an animation is requested with a non-finite or non-positive duration
- **THEN** the helper rejects the request without scheduling an animation

### Requirement: Anime.js easing catalog is available

The client SHALL expose a stable project-owned easing selection surface for
the Anime.js easing catalog, including cubic bezier, power, sine, exponential,
circular, back, elastic, bounce, irregular, steps, linear, and spring easing
families where supported by the installed Anime.js version. Callers SHALL be
able to pass either a named project easing or a custom easing function that
maps normalized progress `[0,1]` to normalized progress.

#### Scenario: Custom cubic bezier easing is usable

- **WHEN** a caller selects a cubic bezier easing with valid control points
- **THEN** the helper applies the resulting curve to normalized progress without
  requiring Babylon Lite to implement the curve

#### Scenario: Easing output is normalized for ordinary curves

- **WHEN** a selected easing returns a finite value for progress in `[0,1]`
- **THEN** the helper passes that value to the animation callback and preserves
  intentional overshoot for easing families that support it

#### Scenario: Unknown named easing fails clearly

- **WHEN** a caller selects a name that is not present in the project easing
  registry
- **THEN** the helper reports an explicit unknown-easing error rather than
  silently falling back to a different curve

### Requirement: Realm transition uses directional bezier easing

As the first integration of the shared animation contract, the realm iris
transition SHALL use the Anime.js easing-editor Bezier Out
preset while closing the source realm and the corresponding Bezier In preset
while opening the destination realm. The covered hold SHALL remain fully
covered and SHALL NOT be eased or shortened by either curve.

#### Scenario: Closing uses Bezier Out

- **WHEN** the source realm iris closes from fully visible to fully covered
- **THEN** the transition progress is transformed by the configured Bezier Out
  curve before the mask radius is rendered

#### Scenario: Opening uses Bezier In

- **WHEN** the destination realm iris opens from fully covered to fully visible
- **THEN** the transition progress is transformed by the configured Bezier In
  curve before the mask radius is rendered

#### Scenario: Realm swap remains hidden

- **WHEN** the transition reaches the covered midpoint
- **THEN** the destination realm swap occurs while the mask is fully covered and
  the opening Bezier In phase does not begin until the configured hold ends

### Requirement: Babylon Lite ownership boundary is preserved

The easing helper SHALL update Babylon Lite targets through the existing game
layer and SHALL NOT replace Babylon Lite's renderer, sprite atlas, animation
manager, or scene lifecycle. Easing support SHALL remain usable for arbitrary
plain-object properties and sprite presentation values.

#### Scenario: Sprite presentation can use shared easing

- **WHEN** a game animation targets a Babylon Lite sprite property
- **THEN** the helper emits eased values that the game layer applies through its
  existing sprite update path

#### Scenario: React UI ownership is unchanged

- **WHEN** a game-layer animation is active
- **THEN** the React-owned UI remains outside the game animation target and its
  existing visibility and input ownership are unchanged
