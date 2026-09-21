# Spec Delta

## ADDED Requirements

### Requirement: Object glyph palette coverage

Every object catalog entry SHALL resolve to an editable ASCII Palette glyph with an explicit base color. The object catalog SHALL use red `♥` for Hearts, `☠` for Traps, `🕯️` for Torches, `🪙` for Gold, and `S` for Stairs. If `🕯️` is absent from the palette inventory, it SHALL be added before Torch rendering is enabled.

#### Scenario: Heart palette color is shared
- **WHEN** the character HUD or a world Heart renders
- **THEN** both SHALL use the same palette-driven red `♥` color

#### Scenario: Torch palette entry exists
- **WHEN** a Torch object is rendered
- **THEN** the palette SHALL provide the `🕯️` glyph identity and its configured color
