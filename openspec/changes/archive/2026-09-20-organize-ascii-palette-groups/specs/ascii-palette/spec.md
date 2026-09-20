# Spec Delta

## ADDED Requirements

### Requirement: Semantic palette Group view
When the developer selects Group sorting in the Ascii Palette, the palette
SHALL organize the existing inventory into named semantic groups rather than
one catch-all punctuation group. The groups SHALL include Letters, Digits,
Punctuation, Single-line Borders, Double-line Borders, Mixed-line Borders,
Blocks and Shading, Terrain, Greek Letters, Mathematical Symbols, Arrows,
Playing Cards, Maps, Status, Weather, Music, Gameplay, Runes, Dice, and Chess.

Box-drawing characters SHALL be classified by their line construction, and
terrain marks SHALL remain separate from UI-border characters. The Maps group
SHALL contain `◈ ▣ ◐ ◑ ◒ ◓`; the Status group SHALL contain
`⊕ ⊖ ⊗ ⊘ ⊞ ⊟`. Grouping SHALL preserve every existing entry, identity, color,
and alpha value; it SHALL not add, remove, or migrate palette entries.

#### Scenario: Browse semantically grouped glyphs
- **WHEN** a developer selects Group sorting with all palette entries visible
- **THEN** each existing palette entry appears once under its semantic group
  and no uncategorized bottom blob is rendered

#### Scenario: Distinguish borders from terrain
- **WHEN** a developer selects Group sorting
- **THEN** single-line, double-line, and mixed-line border glyphs appear in
  their respective border groups and terrain glyphs appear in Terrain

#### Scenario: Browse maps and status glyphs
- **WHEN** a developer selects Group sorting
- **THEN** `◈ ▣ ◐ ◑ ◒ ◓` appear in Maps and `⊕ ⊖ ⊗ ⊘ ⊞ ⊟` appear in Status

### Requirement: Palette Group Header presentation
In Group sorting, each visible semantic group SHALL start with a full-width
header immediately before its glyph row. Each header SHALL use the `Palette
Group Header` style at 10pt. Index and alphabetical sorting SHALL not render
group headers.

#### Scenario: Show group headers
- **WHEN** a developer selects Group sorting with all palette entries visible
- **THEN** every semantic group has one visible 10pt Palette Group Header before
  that group's glyph row

#### Scenario: Filter grouped entries
- **WHEN** a developer filters the palette while Group sorting is active
- **THEN** only groups containing at least one visible glyph render their
  Palette Group Header

#### Scenario: Use another sort
- **WHEN** a developer selects index or alphabetical sorting
- **THEN** the glyph grid renders without Palette Group Headers
