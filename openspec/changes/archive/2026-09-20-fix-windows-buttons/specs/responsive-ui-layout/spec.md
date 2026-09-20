# Spec Delta

## ADDED Requirements

### Requirement: Windows launchers and surfaces remain hit-testable

The three lower-left Windows launchers and every visible control in their resulting windows SHALL receive pointer input above the game canvas and transition surfaces in landscape and portrait presentation modes.

#### Scenario: Activate each Windows launcher
- **WHEN** a player clicks Ascii Settings, Arguments, or Lighting
- **THEN** the corresponding window SHALL open promptly and the browser SHALL remain usable

#### Scenario: Close each Windows surface
- **WHEN** a player uses the corresponding close control, or the modal backdrop where applicable
- **THEN** only the selected window SHALL close and the three launchers SHALL remain usable
