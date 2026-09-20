# Spec Delta

## ADDED Requirements

### Requirement: Per-realm ambient preferences
The game SHALL maintain independently persisted ambient values for Overground
and Underground in the inclusive range `0..1`. Missing stored values SHALL
initialize and persist as `0.9` for Overground and `0.1` for Underground. The
active realm's ambient value SHALL be the level-wide ambient input to its
lighting calculation.

#### Scenario: Active realm selects its ambient
- **WHEN** the player transfers from Overground to Underground
- **THEN** lighting switches from the stored Overground ambient value to the
  stored Underground ambient value without changing either saved preference

#### Scenario: Missing values use realm defaults
- **WHEN** neither realm ambient preference exists in local storage
- **THEN** Overground initializes to `0.9` and Underground initializes to
  `0.1`

### Requirement: Realm ambient control surface
The Lighting window SHALL replace the single ambient control with controls
labeled `Ambient Overground` and `Ambient Underground`. Each control SHALL
display and adjust only its own value in `0.05` increments clamped to `0..1`.

#### Scenario: Adjusting inactive ambient does not alter the current scene
- **WHEN** the player is active in Overground and adjusts Ambient Underground
- **THEN** the saved Underground preference changes while current Overground
  lighting remains unchanged

#### Scenario: Reset restores both realm defaults
- **WHEN** the user activates Reset Settings
- **THEN** both realm ambient preferences are cleared and reload restores
  Ambient Overground `0.9` and Ambient Underground `0.1`
