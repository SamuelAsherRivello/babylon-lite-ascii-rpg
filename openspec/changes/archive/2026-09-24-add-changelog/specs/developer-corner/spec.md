# Spec Delta

## MODIFIED Requirements

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
