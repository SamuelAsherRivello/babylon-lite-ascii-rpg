# Spec Delta

## MODIFIED Requirements

### Requirement: Selectable test presentation aspect
The Settings region SHALL provide a persisted aspect control. A first-time session SHALL select landscape and display the exact label `Aspect (Landscape)`. Activating that control SHALL select portrait; while portrait is selected, the control SHALL display `Aspect (Portrait)` and SHALL toggle back to landscape when activated. Reset Settings SHALL restore landscape. In landscape, the game presentation SHALL fill the available browser viewport and its effective content frame SHALL be wider than tall. In portrait on a desktop-class platform, the game presentation SHALL use a centered, tall 9:16 test frame so desktop users can test portrait behavior. In portrait on a non-mobile browser, the system SHALL show a non-interactive presentation entirely outside that 9:16 frame. It SHALL select either Mossy torch-lit ruins or subtle chained-brick dungeon artwork randomly once per page load, fill the available left and right gutters with that selected layout, and keep the selection until reload. The established rails and visible depth treatment SHALL continue to border the frame. The letterbox SHALL remain present in desktop fullscreen and when the HUD is hidden. In portrait on a mobile platform, the game presentation SHALL fill the available browser viewport rather than enforcing the desktop test-frame ratio, and SHALL NOT show the letterbox presentation.

#### Scenario: Default landscape presentation
- **WHEN** a user opens the game with no saved aspect selection
- **THEN** the Settings control displays `Aspect (Landscape)` and the viewport-filling presentation is wider than tall without gutters or rails

#### Scenario: Desktop user selects portrait testing
- **WHEN** a non-mobile user activates `Aspect (Landscape)`
- **THEN** the control displays `Aspect (Portrait)`, the game uses a centered 9:16 tall test frame, and the available outer space shows the page-load-selected layout and existing rails

#### Scenario: Desktop portrait preserves the game frame
- **WHEN** the selected presentation is visible on a non-mobile browser
- **THEN** its rails and gutters do not resize, cover, or intercept input for the game frame or HUD

#### Scenario: Page-load selection remains stable
- **WHEN** a non-mobile user changes Aspect, HUD visibility, fullscreen, or viewport size after the page loads
- **THEN** the already-selected layout remains visible until the page reloads

#### Scenario: Narrow desktop portrait crops outer presentation
- **WHEN** a non-mobile Portrait viewport leaves little or no horizontal space outside the 9:16 game frame
- **THEN** the game frame retains its 9:16 geometry and any outer artwork may extend beyond the far left and right viewport edges

#### Scenario: Desktop fullscreen portrait presentation
- **WHEN** a non-mobile user enters fullscreen while Portrait mode is selected
- **THEN** the 9:16 game frame, gutters, selected layout, and rails remain visible according to the available viewport width

#### Scenario: Portrait presentation remains when HUD is hidden
- **WHEN** a non-mobile user hides the HUD while Portrait mode is selected
- **THEN** the selected presentation remains visible outside the game frame

#### Scenario: Mobile user selects portrait
- **WHEN** a mobile-platform user activates the aspect control while portrait is selected
- **THEN** the game fills that browser viewport without a forced 9:16 frame or presentation gutters and rails

#### Scenario: Aspect selection persists and resets
- **WHEN** a user refreshes after changing the aspect setting
- **THEN** the selected aspect is restored

#### Scenario: Reset restores landscape
- **WHEN** a user activates Reset Settings after selecting portrait
- **THEN** the next initialized session selects landscape and displays `Aspect (Landscape)`
