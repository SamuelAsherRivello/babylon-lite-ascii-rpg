# Spec Delta

## Purpose

Provides brief, accessible feedback messages that do not interrupt gameplay or
require a dialog, while ensuring rapid notification requests remain readable.

## ADDED Requirements

### Requirement: UI can enqueue a toast notification
The user-interface layer SHALL provide a reusable notification interface that
accepts a text message and presents at most one toast at a time. A toast SHALL
be non-interactive and SHALL be exposed as a polite status update to assistive
technologies.

#### Scenario: A UI action sends a toast
- **WHEN** a UI action enqueues a text notification while no toast is active
- **THEN** the message becomes the active toast without requiring a dialog or
  player interaction

#### Scenario: Toast is announced
- **WHEN** a new active toast message is presented
- **THEN** assistive technology can receive it as a polite status update

### Requirement: Toast enters and exits between equal top panels
The HUD's upper-left region and the minimap SHALL reserve equal responsive
square footprints at the shared top inset. The active toast SHALL be centered
horizontally in the gap between those panels. It SHALL descend from above the
viewport over 250 ms, remain visible for 3 seconds, and ascend back above the
viewport over 250 ms after notification processing is complete. The toast
SHALL remain readable within narrow and wide viewports without introducing page
overflow.

#### Scenario: Portrait toast has room for longer text
- **WHEN** the toast is shown in a portrait viewport
- **THEN** its minimum height SHALL be three times the normal toast height and
  its text SHALL remain centered while longer content wraps

#### Scenario: Desktop toast uses the compact centered lane
- **WHEN** the toast is shown in a landscape viewport at least 1024 px wide
- **THEN** it SHALL be centered in a lane no wider than 920 px, while remaining
  within the space between the equal top panels

#### Scenario: First toast is shown
- **WHEN** an idle notification system receives a message
- **THEN** that toast descends from offscreen above the viewport into the
  centered gap at the shared top inset over 250 ms and remains visible for 3
  seconds

#### Scenario: Final toast is removed
- **WHEN** the active toast completes its visible duration and no message is
  queued
- **THEN** it ascends above the viewport over 250 ms and is removed afterward

### Requirement: Toast messages are processed FIFO without intermediate motion
The notification system SHALL process messages in first-in, first-out order.
When another message is queued at the end of an active toast's 3-second visible
duration, the system SHALL replace the displayed content immediately and begin
a new 3-second visible duration without an exit or enter animation. A message
received while the final toast is exiting SHALL cancel that exit, replace the
displayed content immediately, and begin a new 3-second visible duration.

#### Scenario: Multiple messages are queued
- **WHEN** two or more messages are enqueued before the current visible
  message finishes
- **THEN** each later message replaces the previous one in enqueue order for a
  full 3 seconds, and only the last message animates out

#### Scenario: Message arrives during final exit
- **WHEN** a message is enqueued while the final active toast is ascending
- **THEN** the exit is cancelled and the new message is shown immediately for
  a new 3-second visible duration
