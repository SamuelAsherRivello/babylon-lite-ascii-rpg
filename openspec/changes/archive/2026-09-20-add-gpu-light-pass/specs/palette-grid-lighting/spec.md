# Spec Delta

## ADDED Requirements

### Requirement: Optional GPU light-pass presentation

The game SHALL provide a `Lighting GPU Light Pass` checkbox in Settings. Its value SHALL
persist in browser local storage, default to unchecked when no stored value
exists, and be cleared by Reset Settings. When checked, the game SHALL render
a visual-only soft warm light composite from the current visible torch and
player light field after the normal ASCII glyph render. The composite SHALL
respect the existing source radius, falloff, terrain-shadow, and ambient
results, but SHALL NOT alter the palette, glyph data, terrain, characters,
world generation, collision, movement, or authoritative lighting factors.

#### Scenario: Default sprite-only presentation

- **WHEN** no stored GPU-light-pass preference exists
- **THEN** `Lighting GPU Light Pass` SHALL render unchecked and the game SHALL retain
  the existing sprite-only lighting presentation

#### Scenario: Enable the GPU light pass

- **WHEN** a player checks `Lighting GPU Light Pass` while the game is visible
- **THEN** the current visible scene SHALL gain a soft warm light composite
  without changing any gameplay state or the existing grid-shadow boundaries

#### Scenario: Disable the GPU light pass

- **WHEN** a player unchecks `Lighting GPU Light Pass`
- **THEN** the composite SHALL be removed immediately and the scene SHALL
  return to the sprite-only lighting presentation without reloading the world

#### Scenario: Persist and reset the preference

- **WHEN** a player reloads after setting `Lighting GPU Light Pass` or activates Reset
  Settings
- **THEN** the saved checkbox value SHALL be restored after reload or cleared
  to unchecked after reset, respectively

### Requirement: GPU light pass follows visible lighting changes

When `Lighting GPU Light Pass` is enabled, the visual composite SHALL update whenever
the visible region, player position, torch field, palette color, or active
lighting setting changes. It SHALL use only the currently visible lighting
inputs and SHALL not leave light trails at a former player position.

#### Scenario: Player movement refreshes the composite

- **WHEN** the player moves to a new walkable cell while `Lighting GPU Light Pass` is
  enabled
- **THEN** the composite SHALL reflect the player's new light position and
  SHALL not retain a composite contribution at the former position

#### Scenario: Zoom or resize refreshes the composite

- **WHEN** zoom or viewport size changes while `Lighting GPU Light Pass` is enabled
- **THEN** the composite SHALL align with the newly visible world cells
