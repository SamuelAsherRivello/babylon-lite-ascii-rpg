# Spec Delta

## ADDED Requirements

### Requirement: Selectable test presentation aspect
The Settings region SHALL provide a persisted aspect control. A first-time
session SHALL select landscape and display the exact label `Aspect (Landscape)`.
Activating that control SHALL select portrait; while portrait is selected, the
control SHALL display `Aspect (Portrait)` and SHALL toggle back to landscape
when activated. Reset Settings SHALL restore landscape. In landscape, the game
presentation SHALL fill the available browser viewport and its effective
content frame SHALL be wider than tall. In portrait on a desktop-class
platform, the game presentation SHALL use a centered, tall 9:16 test frame so
desktop users can test portrait behavior. In portrait on a mobile platform,
the game presentation SHALL fill the available browser viewport rather than
enforcing the desktop test-frame ratio.

#### Scenario: Default landscape presentation
- **WHEN** a user opens the game with no saved aspect selection
- **THEN** the Settings control displays `Aspect (Landscape)` and the
  viewport-filling presentation is wider than tall

#### Scenario: Desktop user selects portrait testing
- **WHEN** a desktop-class user activates `Aspect (Landscape)`
- **THEN** the control displays `Aspect (Portrait)` and the game uses a
  centered 9:16 tall test frame

#### Scenario: Mobile user selects portrait
- **WHEN** a mobile-platform user activates the aspect control while portrait
  is selected
- **THEN** the game fills that browser viewport without a forced 9:16 frame

#### Scenario: Aspect selection persists and resets
- **WHEN** a user refreshes after changing the aspect setting
- **THEN** the selected aspect is restored

#### Scenario: Reset restores landscape
- **WHEN** a user activates Reset Settings after selecting portrait
- **THEN** the next initialized session selects landscape and displays
  `Aspect (Landscape)`
