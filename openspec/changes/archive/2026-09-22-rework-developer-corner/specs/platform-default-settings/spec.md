# Spec Delta

## MODIFIED Requirements

### Requirement: Platform-specific unset-setting defaults
The game SHALL classify a browser as Mobile when its primary pointing input is coarse; all other browsers SHALL be classified as PC. When a persisted setting is absent, both platforms SHALL use the current default values, including Zoom `5` and Dev closed. Existing persisted values SHALL take precedence over platform defaults, and first-run defaults SHALL be persisted using the existing settings storage so Reset Settings causes the applicable platform defaults to be selected again. The game SHALL NOT retain a Show UI preference or HUD-hidden mode.

#### Scenario: First mobile visit
- **WHEN** a Mobile browser opens the game with no persisted settings
- **THEN** the game starts with Zoom `5`, Dev closed, and every other setting at its existing PC default

#### Scenario: First PC visit
- **WHEN** a PC browser opens the game with no persisted settings
- **THEN** the game starts with Zoom `5`, Dev closed, and every other setting at its existing PC default

#### Scenario: Saved setting survives a platform default
- **WHEN** a player opens the game with a persisted valid value for a setting
- **THEN** the game uses that saved value instead of the platform default

#### Scenario: Reset uses the current platform defaults
- **WHEN** a player resets settings and the game reloads
- **THEN** the reloaded game selects and persists the applicable platform defaults because the prior saved settings were cleared

#### Scenario: Retired Show UI preference is ignored
- **WHEN** a browser has a previously stored Show UI value
- **THEN** the game does not hide the HUD or expose a Show UI control
