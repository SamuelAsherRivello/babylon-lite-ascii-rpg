# Spec Delta

## Purpose

Provides a game-layer Log System that accepts display events from independent
systems, decides which events become consistent single-line log entries, and
delivers ordered snapshots to the lower-right UI log without exposing mutable
game state.

## ADDED Requirements

### Requirement: Game systems can submit log events

The game layer SHALL provide a Log System that accepts log events from any
game system through a shared event contract. An event SHALL contain a message
value that can be rendered as one log line and MAY contain metadata used by
the Log System's display policy. Calling systems SHALL not write directly to
the Log UI, its DOM, or the bridge snapshot storage.

#### Scenario: Gameplay system submits an event

- **WHEN** a gameplay system submits a valid event with a message
- **THEN** the Log System SHALL evaluate it and, when displayable, append one
  ordered line to the log history

#### Scenario: Event is not displayable

- **WHEN** a system submits an event that the Log System's display policy
  rejects or filters
- **THEN** the event SHALL not create a visible log line and the calling system
  SHALL not need to know how the decision was made

### Requirement: Log lines have consistent normalization and retention

The Log System SHALL normalize each accepted event into one display line,
prevent embedded line breaks from creating additional entries, and preserve
the order in which accepted events arrive. The default log history SHALL
retain the current bounded history size of eight lines, removing the oldest
line when the bound is exceeded.

#### Scenario: Event contains line-break text

- **WHEN** a displayable event message contains line-break characters
- **THEN** the Log System SHALL normalize it to one line before publishing
  the snapshot

#### Scenario: History exceeds the default bound

- **WHEN** a ninth displayable event is accepted with the default retention
  policy
- **THEN** the oldest line SHALL be removed and the newest eight lines SHALL
  remain in chronological order

### Requirement: Log snapshots cross the existing bridge immutably

The game layer SHALL publish an immutable ordered snapshot of display lines
through the existing narrow bridge contract. React SHALL receive log lines
through the snapshot subscription and SHALL not inspect game systems, event
metadata, or mutable game state.

#### Scenario: New event reaches the UI

- **WHEN** the Log System accepts a displayable event
- **THEN** the bridge subscriber SHALL receive an updated ordered snapshot
  containing the new line

#### Scenario: Subscriber receives initial history

- **WHEN** a log subscriber registers after the game has produced entries
- **THEN** the subscriber SHALL receive the current ordered snapshot without
  mutating the Log System's history

### Requirement: Log UI inserts new lines at the bottom

The lower-right Log body SHALL render the ordered snapshot with the newest
line after older lines. New entries SHALL be appended at the bottom of the
body text rather than prepended or sorted independently by the UI.

#### Scenario: New line is rendered

- **WHEN** the bridge snapshot gains a new display line
- **THEN** the Log body SHALL render that line after the previously rendered
  lines

### Requirement: Log UI autoscrolls only while at the bottom

The Log body SHALL track whether the player's scroll position is at the
scrollable bottom. When a new line is rendered while the body is at the
bottom, the UI SHALL scroll to the newest bottom position. When the player has
scrolled upward, new lines SHALL not change the scroll position until the
player scrolls back to the bottom.

#### Scenario: New event arrives while following the log

- **WHEN** a new line arrives and the scrollbar is at the bottom
- **THEN** the Log body SHALL autoscroll to the bottom after rendering the
  new line

#### Scenario: New event arrives while reading history

- **WHEN** a new line arrives after the player scrolls above the bottom
- **THEN** the Log body SHALL preserve the player's current scroll position
  and SHALL not autoscroll

#### Scenario: Player returns to the bottom

- **WHEN** the player scrolls down until the scrollbar reaches the bottom
- **THEN** subsequent new lines SHALL again autoscroll to the newest entry

### Requirement: Existing Log panel behavior remains available

The Log System integration SHALL preserve the lower-right placement, current
collapse and expand controls, existing visible gameplay messages, and the
Log panel's ability to render an empty history.

#### Scenario: Log panel is collapsed and reopened

- **WHEN** the player collapses and then reopens the Log panel
- **THEN** the panel SHALL retain its existing control semantics and render
  the current Log System snapshot

#### Scenario: Empty history is rendered

- **WHEN** the Log System has no accepted display lines
- **THEN** the expanded Log body SHALL remain valid and show no fabricated
  entries

### Requirement: Signed numbers are visually distinct in Log entries

The Log body SHALL render each signed numeric token, including its sign, in a
readable semantic color without changing the color of surrounding message text.
Positive values SHALL use green and negative values SHALL use red.

#### Scenario: Positive and negative values are shown

- **WHEN** a Log entry contains signed values such as `+2` or `-2`
- **THEN** only those signed numeric tokens SHALL receive their corresponding
  positive or negative color
