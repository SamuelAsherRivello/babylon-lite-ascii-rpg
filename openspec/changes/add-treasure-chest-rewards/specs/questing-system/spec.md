# Spec Delta

## ADDED Requirements

### Requirement: All of the Treasure quest definition and progression
The quest catalog SHALL define an `All of the Treasure` quest with exactly one
task labeled `Open treasure chest`. The task SHALL complete after the Quest
System observes one generic `chest-opened` event, using the existing quest
snapshot, selector, HUD, and lifecycle behavior without object-spawner
specific quest logic.

#### Scenario: Treasure quest appears with one task
- **WHEN** the quest catalog is loaded
- **THEN** it SHALL contain `All of the Treasure` with only the `Open treasure
  chest` task

#### Scenario: Opening a chest completes the treasure quest
- **WHEN** `All of the Treasure` is the active quest and the Quest System
  observes one `chest-opened` event
- **THEN** `Open treasure chest` SHALL become complete and the quest state
  SHALL become complete
