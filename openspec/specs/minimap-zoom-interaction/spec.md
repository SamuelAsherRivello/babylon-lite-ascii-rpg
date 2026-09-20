# minimap-zoom-interaction Specification

## Purpose

Lets players zoom the content rendered inside the visible exploration minimap through a quick, repeatable, persisted interaction that does not alter game zoom or the minimap's on-screen size.

## Requirements

### Requirement: Clickable minimap-only scale cycle

While the exploration minimap is visible, it SHALL accept a click at any point on its canvas and cycle the scale of its rendered map content in this order: `1`, then `5`, then `10`, then `1`. The minimap canvas SHALL retain its on-screen dimensions and corner placement at every scale. A click SHALL change scale independently of the clicked map location, including fogged and discovered areas. The selected minimap scale SHALL persist in browser local storage and SHALL be restored after a browser refresh. The scale SHALL NOT be displayed as text or as a separate UI control.

#### Scenario: Click advances the minimap scale

- **WHEN** the current minimap scale is `1` and the player clicks anywhere on the visible minimap
- **THEN** the minimap content scale SHALL become `5`, its on-screen canvas size SHALL remain unchanged, and the game zoom SHALL remain unchanged

#### Scenario: Click wraps from the maximum minimap scale

- **WHEN** the current minimap scale is `10` and the player clicks anywhere on the visible minimap
- **THEN** the minimap scale SHALL become `1` and the game zoom SHALL remain unchanged

#### Scenario: Restored minimap scale stays hidden

- **WHEN** a player selects a minimap scale and refreshes the browser
- **THEN** the minimap SHALL restore that scale without displaying its numeric value

#### Scenario: Hidden minimap cannot change scale

- **WHEN** the exploration minimap is hidden
- **THEN** it SHALL not receive an input that changes the minimap scale
