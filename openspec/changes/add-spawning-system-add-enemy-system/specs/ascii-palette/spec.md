# Spec Delta

## ADDED Requirements

### Requirement: Enemy and spawner glyph palette coverage

The ASCII Palette SHALL retain entries for uppercase `E` and uppercase `S` and SHALL assign both an explicit red base color for Enemy and Enemy Spawner rendering. Runtime lighting MAY adjust visible brightness, but enemy and spawner identity SHALL remain palette-driven.

#### Scenario: Enemy glyph is red
- **WHEN** a visible enemy renders as `E`
- **THEN** its base color SHALL come from the red `E` palette entry

#### Scenario: Spawner glyph is red
- **WHEN** a visible enemy spawner renders as `S`
- **THEN** its base color SHALL come from the red `S` palette entry

