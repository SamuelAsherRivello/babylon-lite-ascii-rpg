# platform-default-settings Specification

## Purpose

Provides platform-appropriate first-run settings and an immersive mobile entry
without replacing settings that a player has already chosen and saved.

## Requirements

### Requirement: Platform-specific unset-setting defaults
The game SHALL classify a browser as Mobile when its primary pointing input is
coarse; all other browsers SHALL be classified as PC. When a persisted setting
is absent, both platforms SHALL use the current default values, including Show
UI defaulting to off. Existing persisted values SHALL take precedence over
platform defaults,
and first-run defaults SHALL be persisted using the existing settings storage
so Reset Settings causes the applicable platform defaults to be selected again.

#### Scenario: First mobile visit
- **WHEN** a Mobile browser opens the game with no persisted settings
- **THEN** the game starts with Zoom `5`, Show UI off, and every other setting
  at its existing PC default

#### Scenario: First PC visit
- **WHEN** a PC browser opens the game with no persisted settings
- **THEN** the game starts with Zoom `5`, Show UI off, and every other setting
  at its existing PC default

#### Scenario: Saved setting survives a platform default
- **WHEN** a player opens the game with a persisted valid value for a setting
- **THEN** the game uses that saved value instead of the platform default

#### Scenario: Reset uses the current platform defaults
- **WHEN** a player resets settings and the game reloads
- **THEN** the reloaded game selects and persists the applicable platform
  defaults because the prior saved settings were cleared

### Requirement: Mobile first-click fullscreen entry
On each Mobile page load, the game SHALL make one fullscreen request from the
first eligible user click after the application has loaded. It SHALL make at
most one automatic request per page load, SHALL leave the triggering click's
normal game or UI action available, and SHALL not retry an automatic request
after it is denied or unsupported. PC sessions SHALL not automatically request
fullscreen; their existing Fullscreen control SHALL remain available.

#### Scenario: First mobile click enters fullscreen
- **WHEN** a Mobile player clicks after a loaded game has not yet made its
  automatic fullscreen request and fullscreen is supported
- **THEN** the game requests fullscreen once and still processes the click's
  normal target action

#### Scenario: Rejected mobile fullscreen request
- **WHEN** the first Mobile click causes a fullscreen request that is rejected
  or unsupported
- **THEN** the game continues normally and makes no further automatic
  fullscreen request until the next page load

#### Scenario: Desktop does not auto-enter fullscreen
- **WHEN** a PC player clicks after the game loads
- **THEN** the game does not automatically request fullscreen and the existing
  Fullscreen control remains usable
