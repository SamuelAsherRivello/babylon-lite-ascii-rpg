# Design

## Context

The bridge layer currently derives Group sorting from digit and letter tests,
with all other entries labelled punctuation. The React palette view already
detects group transitions, but renders only a zero-height full-row spacer.
See proposal.md for motivation and the delta specification for the behavior
contract.

## Goals / Non-Goals

**Goals:**

- Create one authoritative semantic classification and sort order in the
  palette bridge layer.
- Render a visible header at each group transition without changing the
  existing palette editing or filter controls.
- Preserve all current entry data and persistence behavior.

**Non-Goals:**

- Changing the palette inventory, JSON format, migration version, colors, or
  client rendering.
- Altering Index or Alphabetical sorting.

## Decisions

### Use a stable category descriptor for both grouping and labels

The bridge layer will resolve each glyph to a descriptor containing a stable
group key, display label, and order. Sorting and UI group-transition detection
will consume that same descriptor. This prevents independent label and sort
rules from drifting. A flat glyph-to-group mapping for special symbols,
supplemented by narrowly scoped rules for letters, digits, and box drawing,
keeps the classification readable and testable.

Alternative considered: classify directly in the React component. Rejected
because filtering and ordering are domain behavior already owned by the bridge
layer, and duplicating it would make non-UI tests weaker.

### Split box drawing by construction and terrain by purpose

Single-line, double-line, and mixed-line box-drawing glyphs will be assigned
from explicit sets. Terrain marks will use their own explicit set. This avoids
the visually misleading outcome of placing mixed or terrain glyphs beside a
single border family solely because their Unicode blocks are adjacent.

Alternative considered: one Borders group. Rejected because it does not solve
the requested distinction between single and double line construction.

### Render headers as grid rows only in Group mode

The React grid will insert one semantic, full-width header before the first
visible entry of every group. Its `Palette Group Header` class will define the
10pt treatment. The current spacer is replaced rather than stacked with a
header, avoiding an extra blank row. Filtering occurs before sorting, so a
header is naturally omitted for groups with no visible entries.

Alternative considered: CSS pseudo-content on spacer nodes. Rejected because
group labels are data, need accessible text, and should not be encoded in CSS.

## Risks / Trade-offs

- [In-flight inventory can change before implementation] → Classify the
  user-added entries from the current palette at apply time and add focused
  tests for every agreed special-symbol family.
- [A glyph could match more than one visual family] → Give explicit special
  mappings precedence over broad category rules and cover the mapping in tests.
- [Header rows reduce the vertical density of Group view] → Restrict them to
  Group sorting and use the requested compact 10pt style.

## Migration Plan

No data migration or rollout action is required. The implementation changes
only the derived Group view. Reverting the grouping logic and header markup
returns the prior layout without modifying palette data.
