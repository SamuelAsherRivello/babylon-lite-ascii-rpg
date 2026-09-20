# Proposal

## Why

The Group view currently divides digits and Latin letters but collapses the
remaining palette into one punctuation section. This makes the increasingly
rich symbol inventory hard to scan when choosing glyphs for map construction
or game-state display.

## What Changes

- Replace the current letter-or-punctuation grouping with stable, semantic
  palette groups and a deterministic group order.
- Keep existing palette entries and their identities unchanged; this change
  classifies the glyphs already present in the working inventory and does not
  add, remove, or migrate glyphs.
- Separate box-drawing glyphs into single-line, double-line, and mixed-line
  border groups; keep terrain marks distinct from borders.
- Present each group in Group sort with a full-width `Palette Group Header`
  immediately before its glyph row, using a 10pt visual treatment.
- Classify the agreed glyph families, including Arrows, Playing Cards, Weather,
  Terrain, Greek Letters, Runes, Dice, Chess, Maps, and Status. Maps contains
  `◈ ▣ ◐ ◑ ◒ ◓`; Status contains `⊕ ⊖ ⊗ ⊘ ⊞ ⊟`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `ascii-palette`: Define semantic Group-sort organization and its visible
  Palette Group Header treatment.

## Impact

- Affects palette grouping and sorting in the bridge layer, Group-view markup
  in the React UI layer, its stylesheet, and focused palette tests.
- Does not change the palette file format, glyph identities, persistence,
  rendering, dependencies, or public APIs.
