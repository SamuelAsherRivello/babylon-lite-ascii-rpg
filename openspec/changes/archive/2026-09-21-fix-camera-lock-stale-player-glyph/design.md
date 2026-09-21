# Design

## Context

The Babylon Lite game layer renders a bounded world composition into reusable
sprite slots. The current game-view composition filters out undiscovered cells
before the render callback receives them, while slot hiding is performed only
for callbacks that explicitly report an undiscovered cell. This leaves a gap:
an omitted cell cannot clear the slot previously used by another world cell.

Camera Lock makes this visible when a screen-edge wrap shifts the source
rectangle and reuses slots for newly exposed cells. The authoritative world
character data is already updated correctly; the defect is presentation-slot
reconciliation.

## Goals / Non-Goals

**Goals:**

- Reconcile every game-view slot during a full world render.
- Preserve the existing fog rule that undiscovered cells produce no world
  glyph or background.
- Keep the fix compatible with Camera Center, Camera Deadzone, viewport resize,
  realm transitions, and normal lighting refreshes.
- Add a focused regression test at the composition/slot boundary without
  introducing a browser automation test.

**Non-Goals:**

- Do not alter camera-origin calculations or world wrapping rules.
- Do not reveal fogged cells or change discovery timing.
- Do not change minimap rendering, palette data, sprite atlas behavior, or
  public bridge APIs.

## Decisions

### Include undiscovered cells in the game composition pass

The game-view render will visit every cell in its bounded source rectangle and
use the existing `discovered` flag to hide ineligible slots. This keeps slot
identity aligned with the row-major source rectangle and makes the existing
hide path effective for newly undiscovered cells.

The alternative—keeping the filtered composition and separately calculating a
set of omitted slots—duplicates source-rectangle traversal and creates a second
slot-clearing contract. The all-slots pass is simpler and preserves the shared
composition's fog decision without drawing hidden content.

### Keep minimap filtering unchanged

The minimap may continue to omit undiscovered cells because it paints a canvas
background and has no reusable game sprite slots. The change is scoped to the
game-view target-layer submission; shared fog eligibility remains unchanged.

### Test the observable slot lifecycle

Add a focused test that models a previously visible slot followed by an
undiscovered cell in the same slot and asserts that the slot is hidden. Keep
existing camera helper tests for origin/wrap behavior and add no Playwright
coverage, consistent with repository guidance.

## Risks / Trade-offs

- [Performance] The full pass invokes the composition callback for undiscovered
  cells → Mitigation: composition already bounds iteration to the visible
  rectangle, hidden callbacks perform only a slot hide, and no glyph raster is
  requested for undiscovered cells.
- [Regression] A slot could be hidden without being reactivated correctly on a
  later discovered render → Mitigation: retain the existing `visible` state
  transition and add a discovered-after-hidden assertion in the focused test.
- [Scope drift] A future refactor could reintroduce filtered game composition
  → Mitigation: document and test that full game-view passes reconcile every
  source slot.
