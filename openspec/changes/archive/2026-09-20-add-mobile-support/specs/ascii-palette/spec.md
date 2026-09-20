# Spec Delta

## ADDED Requirements

### Requirement: Responsive palette glyph cards
The Ascii Palette SHALL render every visible glyph identity and glyph entirely
inside its selectable card in both portrait and landscape viewports. Group
sorting SHALL adapt its column count to available width and SHALL not force a
fixed column count that causes glyph-card overflow or horizontal scrolling.

#### Scenario: Browse Group sorting in portrait
- **WHEN** a developer selects Group sorting with all entries visible in a
  portrait viewport
- **THEN** every visible glyph card contains its identity and glyph without
  overlap or horizontal window overflow

#### Scenario: Browse another palette sort in portrait
- **WHEN** a developer selects Index or Alphabetical sorting in a portrait
  viewport
- **THEN** the glyph cards remain fully contained and selectable
