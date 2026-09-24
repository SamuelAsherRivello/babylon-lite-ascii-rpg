# deferred-world-initialization Specification

## Purpose
Allows the complete initial world to be presented before nonvisual initialization finishes, while preserving placement, logical simulation behavior, responsiveness, and session ownership.

## Requirements

### Requirement: Placement-ready actors precede nonvisual route preparation
The client SHALL establish final initial actor positions, glyphs, occupancy, collision eligibility, and birth time before presenting the complete initial visible world. Exact NPC patrol destination and route preparation SHALL begin after at least one browser presentation opportunity for that placement. Any reachability or eligibility condition that affects initial placement SHALL be satisfied before selecting that placement. Deferred preparation SHALL NOT change that initial placement or consume another feature's random stream.

#### Scenario: NPC is visible before its brain finishes
- **WHEN** an eligible NPC is spawned with pending patrol preparation
- **THEN** it occupies and renders at its selected initial cell before deferred route preparation runs
- **AND** completion attaches its destination and route without respawning or relocating it

#### Scenario: Spawn eligibility remains authoritative
- **WHEN** an adjacent cell cannot satisfy the NPC spawn's required patrol feasibility
- **THEN** that cell is excluded before initial placement, even though exact route selection is deferred

### Requirement: Bounded deferred initialization
Deferred nonvisual work SHALL start after the initial presentation opportunity and execute in bounded, resumable work slices. Expensive individual jobs SHALL NOT be allowed to monopolize a later frame merely because they were deferred. The client SHALL distinguish pending, completed, cancelled, and failed preparation and keep browser controls responsive while work remains pending.

#### Scenario: Multiple expensive patrol preparations
- **WHEN** several NPC routes require preparation
- **THEN** the client allows presentation/input opportunities between bounded work slices and eventually settles each current job
- **AND** diagnostics report queue wait and longest work slice independently of first-view readiness

#### Scenario: No feasible exact route
- **WHEN** a current route-preparation job exhausts its established candidate policy
- **THEN** it settles with the established stationary empty-route result without retrying indefinitely or moving the NPC to another cell

### Requirement: Scheduler-independent simulation behavior
Deferred initialization SHALL retain deterministic route decisions and actor logical time for identical world inputs and gameplay events. If an actor's eligible action depends on unfinished preparation, the client SHALL resolve that dependency before committing the action and preserve logical event order. It SHALL NOT silently skip actions, reset birth time, perform a burst of catch-up movement, or bypass bounded preparation with an unbounded synchronous operation.

#### Scenario: First action arrives before preparation finishes
- **WHEN** logical time reaches an NPC's first eligible patrol action while its route is pending
- **THEN** the dependent action waits for prioritized bounded preparation and produces the same action as a run whose route was ready earlier
- **AND** the actor's birth time and action cadence remain unchanged

#### Scenario: Frame schedules vary
- **WHEN** identical seeded worlds and logical inputs run with different deferred-work scheduling delays
- **THEN** final placements, route choices, occupancy, and committed actor actions match

### Requirement: Deferred work obeys lifecycle and revision ownership
Deferred work SHALL publish only to its originating live session, actor, and compatible world revision. Restart, disposal, actor removal, or incompatible world replacement SHALL invalidate obsolete work. Realm switching SHALL prioritize current work without duplicating actors or tick subscriptions; pending valid inactive-realm work SHALL resume safely or be cancelled and replaced safely. Background suspension or failure SHALL NOT permit obsolete results to mutate current state.

#### Scenario: Restart while a route is pending
- **WHEN** a new world replaces a session with pending route jobs
- **THEN** old jobs cannot update occupancy, render content, or register callbacks in the replacement world

#### Scenario: Realm changes while preparation is pending
- **WHEN** the player changes realms and later returns
- **THEN** each surviving actor has at most one current preparation job and one simulation registration, and no stale revision is published

#### Scenario: Preparation throws or the document resumes
- **WHEN** a job fails or execution resumes after background suspension
- **THEN** failures are settled and reported, and only current valid work can resume without an unhandled rejection or permanently pending queue entry

### Requirement: Defer only work independent of immediate world correctness
The first complete visible world SHALL include all applicable enabled placement layers with correct fog, lighting, occupancy, and collisions. Initial render correctness and paired-realm placement dependencies SHALL remain prerequisites. Settings previews SHALL prepare only the data needed for their preview and SHALL NOT activate gameplay AI. Other nonvisual initialization SHALL be deferred or prepared on demand only when its consumers' correctness and readiness remain satisfied.

#### Scenario: Paired stairs and barriers are ready
- **WHEN** the first complete active-realm view is presented with stairs and civilization enabled
- **THEN** stairs are valid in both realms and all visible barriers and actor occupancy already participate in collision rules

#### Scenario: Preview NPC markers
- **WHEN** a settings-map preview includes NPC placement markers
- **THEN** the preview displays its placement result without preparing live patrol behavior or advancing gameplay time
