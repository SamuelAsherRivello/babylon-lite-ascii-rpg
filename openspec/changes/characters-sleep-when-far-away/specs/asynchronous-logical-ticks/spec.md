# Spec Delta

## MODIFIED Requirements

### Requirement: Each eligible system receives ordered logical tick calls

For each committed tick, every eligible system SHALL receive exactly one call with the signature `tick(currentTimeInTUnits, deltaTimeInMilliseconds)`. Before the coordinator schedules deferred work, it SHALL determine eligibility from the current committed game state. A sleeping character that is not in the living player's realm or is more than 50 cardinal grid cells away SHALL not receive a call and SHALL not create queued logical-tick work. The coordinator SHALL call eligible systems in logical tick order and SHALL not require systems to inspect, compare, queue, or repair tick ordering. Entities removed before their pending delivery SHALL receive no delivery, and entities registered during a tick SHALL begin with the next applicable tick according to the existing birth and registration rules.

#### Scenario: Pending delivery remains exactly once

- **WHEN** tick 2 is split across three render frames and an eligible enemy remains present throughout resolution
- **THEN** the enemy system SHALL receive `tick(2, deltaTimeInMilliseconds)` once, not once per render frame, and SHALL process that call without determining whether tick 2 is in order

#### Scenario: Sleeping character creates no pending delivery

- **WHEN** tick 2 is committed while a registered ambient character is ineligible because it is in another realm or more than 50 cardinal grid cells from the living player
- **THEN** the deferred scheduler SHALL contain no logical-tick job for that character at time 2

#### Scenario: Removed entity is cancelled

- **WHEN** an entity is removed after tick 2 is committed but before its queued tick-2 work runs
- **THEN** its pending tick-2 work SHALL be cancelled or ignored and SHALL not mutate the world
