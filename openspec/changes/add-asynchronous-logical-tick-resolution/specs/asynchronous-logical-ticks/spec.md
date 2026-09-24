# Spec Delta

## Purpose

Provides a deterministic logical-tick lifecycle that spreads simulation work across render frames while keeping the renderer responsive and preserving the game's authoritative time and entity semantics.

## ADDED Requirements

### Requirement: Logical ticks are independent of render frames

The game SHALL treat a time tick as a logical simulation event that is triggered on a particular render frame but MAY resolve over multiple later render frames. Tick resolution SHALL NOT block normal rendering, animation, or game-layer presentation.

#### Scenario: One tick spans multiple render frames

- **WHEN** a player movement triggers time tick 2 on render frame 100 and tick work exceeds the available work budget
- **THEN** tick 2 SHALL remain the same logical event while its unfinished work resumes on later render frames, and each intervening frame SHALL remain eligible to render

### Requirement: Tick identity is committed immediately

When a valid time-consuming action advances world time, the game SHALL commit the new integer time and immutable cause immediately, before scheduling the tick's resumable work. The committed logical time SHALL NOT depend on the render frame on which individual systems finish.

#### Scenario: Movement commits time before system completion

- **WHEN** the player successfully moves from time 1 and the resulting tick work is pending
- **THEN** the authoritative time SHALL become 2 immediately, the tick event SHALL identify time 2 and cause `movement`, and pending system work SHALL not delay the time commit

### Requirement: Each eligible system receives ordered logical tick calls

For each committed tick, every eligible system SHALL receive exactly one call with the signature `tick(currentTimeInTUnits, deltaTimeInMilliseconds)`. The coordinator SHALL call systems in logical tick order and SHALL not require systems to inspect, compare, queue, or repair tick ordering. Entities removed before their pending delivery SHALL receive no delivery, and entities registered during a tick SHALL begin with the next applicable tick according to the existing birth and registration rules.

#### Scenario: Pending delivery remains exactly once

- **WHEN** tick 2 is split across three render frames and a registered enemy remains present throughout resolution
- **THEN** the enemy system SHALL receive `tick(2, deltaTimeInMilliseconds)` once, not once per render frame, and SHALL process that call without determining whether tick 2 is in order

#### Scenario: Removed entity is cancelled

- **WHEN** an entity is removed after tick 2 is committed but before its queued tick-2 work runs
- **THEN** its pending tick-2 work SHALL be cancelled or ignored and SHALL not mutate the world

### Requirement: Multi-unit advances announce every logical tick in order

When one action advances time by multiple units, the coordinator SHALL announce each logical tick separately and in ascending order. Each system SHALL receive tick `n` before tick `n+1`; asynchronous resolution SHALL not merge, skip, or reorder those announcements.

#### Scenario: A later movement arrives during pending work

- **WHEN** one movement advances time from 1 to 4
- **THEN** systems SHALL receive `tick(2, elapsedDelta)`, `tick(3, 0)`, and `tick(4, 0)` in that order, with each call independently eligible to resolve across later render frames

### Requirement: Tick deltas use trigger-time wall-clock intervals

The coordinator SHALL capture real elapsed wall-clock milliseconds when a logical tick is triggered. A normal tick SHALL receive the time since the preceding logical tick trigger; for a multi-unit advance at one trigger moment, only the first logical tick SHALL receive that elapsed interval and every subsequent tick in the batch SHALL receive `0`. The initial/session-start tick SHALL receive `0`.

#### Scenario: Delayed movement supplies elapsed time

- **WHEN** tick 1 is triggered and the player waits 1000 milliseconds before triggering tick 2
- **THEN** systems SHALL receive tick 1 with the startup delta and tick 2 with a delta of approximately 1000 milliseconds, independent of asynchronous tick-1 resolution time

#### Scenario: Batch ticks assign delta once

- **WHEN** one action triggers ticks 2, 3, and 4 at one real-time instant after 250 milliseconds
- **THEN** systems SHALL receive deltas `250`, `0`, and `0` respectively

### Requirement: Cancellation and lifecycle boundaries are safe

Pending tick work SHALL be associated with the current game session and relevant realm/entity revisions. Restart, disposal, incompatible realm/world replacement, or entity removal SHALL prevent obsolete work from publishing mutations into the current game state.

#### Scenario: Restart invalidates pending work

- **WHEN** a realm or game session is replaced while tick 2 work is pending
- **THEN** obsolete tick-2 jobs SHALL settle as cancelled or stale and SHALL not update the replacement session

### Requirement: Simulation remains game-layer authoritative

Asynchronous tick resolution SHALL remain entirely inside the Babylon Lite game layer. React SHALL receive only the existing approved immutable snapshots and SHALL not receive tick queues, mutable entity state, scheduler handles, or partial simulation internals.

#### Scenario: React observes approved results only

- **WHEN** an asynchronous tick changes player stamina, health, logs, or visible presentation
- **THEN** React SHALL receive the corresponding approved immutable snapshot updates without owning or resolving the tick
