# Spec Delta

## ADDED Requirements

### Requirement: Player GPU shadow-bleed command remains narrow

React SHALL persist and present the `Player GPU Shadow Bleed Range` setting,
then send only its selected scalar range through the existing narrow bridge.
The Babylon Lite game layer SHALL own the selected range, all player-shadow
mask data, GPU presentation resources, and their disposal. React SHALL NOT
inspect world cells, light fields, shadow masks, or renderer resources.

#### Scenario: UI changes player shadow-bleed range

- **WHEN** a player changes `Player GPU Shadow Bleed Range` in Settings
- **THEN** the game layer SHALL apply the selected range to subsequent player
  GPU light presentation without changing simulation state

#### Scenario: Stored range restores after game-controller registration

- **WHEN** the UI loads a stored player GPU shadow-bleed range before the game
  layer registers its controller
- **THEN** the bridge SHALL provide the latest selected range when that
  controller becomes available
