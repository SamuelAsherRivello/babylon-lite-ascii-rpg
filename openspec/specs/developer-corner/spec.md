# developer-corner Specification

## Purpose
Defines a compact lower-left developer panel that retains developer tools in a
consistent, collapsible HUD surface without exposing retired HUD visibility UI.

## Requirements

### Requirement: Collapsible lower-left Dev panel
The game SHALL render the lower-left developer tools in a panel labeled `Dev`.
The panel SHALL use the same open and closed interaction structure as the
lower-right Log panel, SHALL begin closed when no Dev state is stored, and
SHALL persist its open state in local storage. When open, the Dev panel SHALL
match the Log panel's width and height. The Dev body SHALL not display a
scrollbar.

#### Scenario: First visit starts with a Dev launcher
- **WHEN** the game loads without a stored Dev-panel state
- **THEN** a closed `Dev` launcher appears in the lower-left corner

#### Scenario: Dev state persists
- **WHEN** a developer opens or closes the Dev panel and reloads the game
- **THEN** the panel restores the saved open or closed state

#### Scenario: Open Dev matches Log geometry
- **WHEN** Dev and Log are both open
- **THEN** their panels have matching width and height while remaining anchored to their respective lower corners

### Requirement: Existing developer tools remain available
The open Dev panel SHALL retain the existing GitHub link, Windows tools, Info
tools, and Settings tools. The Developer checkbox SHALL be removed, and no
replacement Show UI control SHALL be rendered. The Windows tools SHALL include
a `Changelog` control that opens the versioned release-history window.

#### Scenario: Existing tools remain in Dev
- **WHEN** a developer opens Dev
- **THEN** the GitHub link and every pre-existing Windows, Info, and Settings control except the Developer checkbox are available
- **AND** a `Changelog` control is available in Windows tools

#### Scenario: Retired Developer control is absent
- **WHEN** the developer tools render
- **THEN** no Developer checkbox or Show UI control is displayed

### Requirement: Dev typography is scoped and compact
The Dev panel SHALL use two scoped text treatments named `developer-title` and
`developer-body-text`. Each treatment SHALL render at 8pt, preserving the
existing title and body weight distinction without changing typography outside
the Dev panel.

#### Scenario: Dev typography does not affect other HUD text
- **WHEN** Dev is open
- **THEN** its titles and body text render at 8pt while Log and other HUD regions retain their existing font sizes

### Requirement: PFX Windows launcher
The Windows developer tools SHALL include a `PFX` launcher alongside the existing Lighting launcher.

#### Scenario: Windows tools expose PFX
- **WHEN** the developer opens the Dev panel and views Windows tools
- **THEN** a `PFX` control is available without removing the existing Windows controls
