# Spec Delta

## ADDED Requirements

### Requirement: Upper-right minimap and lower-left project link placement

The upper-right HUD area SHALL always contain the minimap. The
project GitHub link SHALL appear immediately above the Windows list in the
lower-left HUD region. These placements SHALL remain inside the shared HUD
inset in supported desktop landscape and mobile portrait layouts.

#### Scenario: Minimap occupies the upper right

- **WHEN** the HUD is visible
- **THEN** it is displayed in the upper-right area and the GitHub link is not
  displayed there

#### Scenario: Project link precedes Windows

- **WHEN** the HUD is visible
- **THEN** the GitHub link appears immediately above the Windows list in the
  lower-left region
