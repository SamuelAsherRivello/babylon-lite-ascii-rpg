# Spec Delta

## MODIFIED Requirements

### Requirement: World-time advances broadcast deterministic ticks

Each world-time advance SHALL publish the new integer time exactly once in deterministic registration order to every currently registered tickable entity that is eligible for that advance. Ordinary registered entities SHALL remain eligible. A registered sleeping character SHALL be ineligible when it is not in the living player's realm or its cardinal grid distance from that player is greater than `50`; it SHALL receive neither a delivery nor a deferred job for that time. An eligible character SHALL resume normal delivery on the first later advance for which it is eligible, without retroactive deliveries. Entities outside the visible region but within the active radius SHALL remain eligible. An entity removed during a tick SHALL receive no future ticks, and an entity registered during a tick SHALL begin receiving ticks on the next world-time advance.

#### Scenario: Sleeping character receives no tick

- **WHEN** world time advances from 7 to 8 while a living enemy or ambient NPC is in the other realm or more than 50 cardinal grid cells from the living player
- **THEN** that character receives no time-8 delivery or deferred time-8 job while unaffected registered entities receive their deterministic deliveries

#### Scenario: Nearby offscreen character receives a tick

- **WHEN** world time advances with a living character in the player's realm at cardinal distance 50 or less but outside the visible region
- **THEN** that character receives the new time exactly once in deterministic registration order

#### Scenario: All registered entities receive a tick

- **WHEN** world time advances from 7 to 8 with tickable characters, NPCs, enemies, and spawners registered across both realms
- **THEN** every ordinary entity and every eligible character receives time 8 exactly once in deterministic order, while sleeping characters receive no delivery

#### Scenario: Waking character does not catch up

- **WHEN** a sleeping character becomes eligible before a later world-time advance
- **THEN** it receives that later time once and receives none of the times skipped while it slept

#### Scenario: Removed entity stops ticking

- **WHEN** an enemy or spawner is destroyed and unregistered at time 12
- **THEN** it SHALL receive no tick for time 13 or any later time

#### Scenario: New entity begins on the next advance

- **WHEN** a spawner creates an enemy while processing time 31
- **THEN** the enemy SHALL be born at time 31 and SHALL first receive an eligible normal broadcast tick when time advances to 32
