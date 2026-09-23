# Spec Delta

## ADDED Requirements

### Requirement: Visible mountain damage creates floating text

When a visible interior Overground mountain receives damage, the game SHALL
render a separate red signed floating damage value at the mountain's cell. The
value SHALL equal the actual health removed after damage clamping. Damage to a
mountain that is not rendered in the active game view SHALL NOT create or later
replay floating text.

#### Scenario: Visible mountain takes damage
- **WHEN** a visible interior Overground mountain loses `20` health
- **THEN** a red `-20` floating value SHALL appear at that mountain's cell

#### Scenario: Mountain damage occurs outside the active view
- **WHEN** an interior Overground mountain receives damage while not rendered
  in the active game view
- **THEN** no floating text record SHALL be created for that damage
