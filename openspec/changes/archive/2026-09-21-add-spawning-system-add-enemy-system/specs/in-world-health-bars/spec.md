# Spec Delta

## Purpose

Provides transient non-diegetic health feedback above damaged world entities without duplicating the player's existing HUD health display.

## ADDED Requirements

### Requirement: Damageable non-player entities use transient health bars

A visible enemy or enemy spawner SHALL have a renderer-owned health bar centered above its glyph after taking damage. The bar SHALL be approximately one grid cell wide and one quarter grid cell tall, use a small visual gap above the entity, render current health in red, render the latest lost-health delta in a lighter red, render remaining unfilled health as a dark region, and use a thin light outline consistent with the approved mockup. The overlay SHALL NOT occupy a world cell or change movement, collision, terrain, fog, or entity state.

#### Scenario: Damaged entity shows proportional health
- **WHEN** a visible enemy or spawner takes damage
- **THEN** a centered bar SHALL appear above it with red fill proportional to current health out of maximum health

#### Scenario: Latest damage appears as a delta segment
- **WHEN** a visible enemy or spawner loses health
- **THEN** the newly lost portion SHALL appear immediately after current health in a lighter-red delta segment for `0.3` seconds before collapsing into the dark unfilled region

#### Scenario: Offscreen overlay is not rendered
- **WHEN** a damaged entity is outside the active visible region or in another realm
- **THEN** its health-bar presentation SHALL not be submitted while its gameplay state remains unchanged

### Requirement: Damage controls health-bar visibility timing

The health bar SHALL normally be hidden, fade from hidden to visible over `0.1` seconds after damage, remain fully visible until `1` second after the most recent damage, and fade to hidden over `0.1` seconds. Damage received during fade-in, hold, or fade-out SHALL update the current fill and latest damage-delta segment immediately, restart the delta's `0.3`-second visibility, and restart the one-second hold from that latest damage.

#### Scenario: One damage event completes visibility cycle
- **WHEN** a visible enemy or spawner takes damage and receives no further damage
- **THEN** its bar SHALL fade in for 0.1 seconds, remain visible for 1 second, fade out for 0.1 seconds, and become hidden

#### Scenario: Repeated damage extends visibility
- **WHEN** the entity takes additional damage before its bar becomes hidden
- **THEN** the bar SHALL update to the latest health and latest damage delta and remain fully visible until 1 second after the latest damage before fading out

### Requirement: Player has no in-world health bar

The player SHALL NOT render an in-world health bar because the existing Character HUD is the sole player-health presentation.

#### Scenario: Player takes damage
- **WHEN** an enemy damages the visible player
- **THEN** the Character HUD SHALL update through its existing health snapshot and no health bar SHALL appear above `P`
