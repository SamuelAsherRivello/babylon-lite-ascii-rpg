# Spec Delta

## Purpose

Provides reusable, timed visual transitions owned by the Babylon Lite game
layer, so world or layout changes can be hidden behind a consistent animation
without covering React-owned interface surfaces.

## ADDED Requirements

### Requirement: Game-layer transition lifecycle

The game layer SHALL provide a transition capability that accepts a target
game-layer presentation, an animation, a duration, and lifecycle callbacks or
events. A transition SHALL expose ordered start, covered/midpoint, and complete
notifications, and SHALL reject or ignore a new transition request while one
is already active.

#### Scenario: Transition events are ordered

- **WHEN** a transition is accepted
- **THEN** the game layer emits start, then covered/midpoint, then complete in
  that order, with the covered/midpoint event occurring while the target game
  presentation is fully obscured

#### Scenario: Concurrent transition is not started

- **WHEN** a second transition is requested before the active transition
  completes
- **THEN** the second request does not start a second animation or emit a
  second start event

### Requirement: Soft-edged iris presentation

The game-layer iris animation SHALL render red outside a circular reveal
centered on the game viewport, with a visibly feathered edge rather than a
hard binary boundary. The closing phase SHALL reduce the reveal to the
player-character-sized opening over 2 seconds, and the opening phase SHALL
expand from that opening to fully reveal the destination game view over 2
seconds.

#### Scenario: Iris closes over the source realm

- **WHEN** a realm transition begins from a fully visible game view
- **THEN** a soft-edged circular reveal centered on the player/camera closes
  over 2 seconds until the source game view outside the character-sized
  opening is red

#### Scenario: Iris opens over the destination realm

- **WHEN** the destination realm has been selected at full coverage
- **THEN** the soft-edged circular reveal expands over 2 seconds until
  the destination game view is fully visible and the mask is removed

### Requirement: Transition midpoint hides game-state replacement

For a transition that changes game presentation, the game layer SHALL perform
the presentation change only after the closing phase reaches full coverage and
before the opening phase begins.

#### Scenario: Realm swap occurs while covered

- **WHEN** the player enters a paired `S` stair during gameplay
- **THEN** the active realm and its graphics are changed only at the covered
  midpoint, and no source-to-destination visual swap is exposed through the
  iris opening

### Requirement: Transition suspends game input

While a game-layer transition is active, keyboard, pointer, swipe, and held-key
repeat input SHALL be ignored for movement and SHALL not trigger another realm
transfer. Starting a transition SHALL clear pending movement input and timers;
completing it SHALL leave input available for the destination realm.

#### Scenario: Movement is paused during realm transfer

- **WHEN** the player is inside either 2-second iris phase
- **THEN** movement does not change the player cell, advance game time, or
  retrigger a stair transfer

#### Scenario: Input resumes after the iris completes

- **WHEN** the opening phase completes
- **THEN** the player can provide new movement input for the destination realm
