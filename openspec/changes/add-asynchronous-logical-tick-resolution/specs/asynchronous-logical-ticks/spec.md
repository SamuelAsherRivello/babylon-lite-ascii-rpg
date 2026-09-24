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

### Requirement: Each eligible tickable receives exactly one logical delivery

For each committed tick, every tickable entity eligible at dispatch SHALL receive that tick exactly once in the established deterministic registration order. Entities removed before their pending delivery SHALL receive no delivery, and entities registered during a tick SHALL begin with the next applicable tick according to the existing birth and registration rules.

#### Scenario: Pending delivery remains exactly once

- **WHEN** tick 2 is split across three render frames and a registered enemy remains present throughout resolution
- **THEN** the enemy SHALL process tick 2 once, not once per render frame

#### Scenario: Removed entity is cancelled

- **WHEN** an entity is removed after tick 2 is committed but before its queued tick-2 work runs
- **THEN** its pending tick-2 work SHALL be cancelled or ignored and SHALL not mutate the world

### Requirement: Pending ticks preserve logical ordering

The game SHALL preserve the configured simulation ordering for dependent work when additional ticks are triggered while an earlier tick remains unresolved. A later tick SHALL NOT cause a system to observe a dependent state transition out of logical order.

#### Scenario: A later movement arrives during pending work

- **WHEN** tick 2 is still resolving and another successful movement triggers tick 3
- **THEN** the game SHALL retain both logical tick identities and SHALL process dependent system work according to its declared ordering contract without rewriting, dropping, or duplicating either tick

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
