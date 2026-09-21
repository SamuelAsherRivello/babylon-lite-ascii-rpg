# Spec Delta

## ADDED Requirements

### Requirement: World-time advances broadcast deterministic ticks

Each world-time advance SHALL publish the new integer time to every currently registered tickable entity exactly once in deterministic registration order. Tick delivery SHALL include entities outside the active realm and visible region. An entity removed during a tick SHALL receive no future ticks, and an entity registered during a tick SHALL begin receiving ticks on the next world-time advance.

#### Scenario: All registered entities receive a tick
- **WHEN** world time advances from 7 to 8 with tickable characters, NPCs, enemies, and spawners registered across both realms
- **THEN** each registered entity SHALL receive time 8 exactly once in deterministic order

#### Scenario: Removed entity stops ticking
- **WHEN** an enemy or spawner is destroyed and unregistered at time 12
- **THEN** it SHALL receive no tick for time 13 or any later time

#### Scenario: New entity begins on the next advance
- **WHEN** a spawner creates an enemy while processing time 31
- **THEN** the enemy SHALL be born at time 31 and SHALL first receive a normal broadcast tick when time advances to 32

### Requirement: Time-consuming collision attacks advance time

A valid player attack caused by attempted movement into an enemy or spawner SHALL advance world time by exactly one even though the player remains in its cell. Attempts against an already removed target or other blocked movement SHALL not advance time.

#### Scenario: Player attack advances time
- **WHEN** the player attempts to move into a living adjacent enemy or spawner and deals damage
- **THEN** world time SHALL increase by exactly one and the resulting tick SHALL be broadcast

