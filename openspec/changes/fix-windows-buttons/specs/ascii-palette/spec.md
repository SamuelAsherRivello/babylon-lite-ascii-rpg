# Spec Delta

## ADDED Requirements

### Requirement: Ascii Settings window remains responsive

The Ascii Settings launcher SHALL open the existing editor without freezing the browser, and its close button and backdrop SHALL close only that editor while preserving the current game and staged editor behavior.

#### Scenario: Open and close Ascii Settings repeatedly
- **WHEN** a player activates Ascii Settings, closes it, and repeats the cycle
- **THEN** the editor SHALL appear and disappear each time, and the game SHALL remain responsive after every cycle

#### Scenario: Use the editor while open
- **WHEN** a player switches tabs, filters, sorts, or selects a glyph in the open editor
- **THEN** the editor SHALL respond normally without freezing or losing the underlying game
