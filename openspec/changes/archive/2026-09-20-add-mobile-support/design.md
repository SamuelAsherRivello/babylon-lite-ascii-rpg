# Design

## Context

The React UI layer uses one fixed inset and four absolutely positioned corner
regions. Its palette dialog has a fixed `100px` inset and Group sorting forces
ten grid columns. The Babylon Lite game layer owns the full-screen canvas and
currently drives movement through a keyboard-key set plus one repeat timer.
See proposal.md and the delta specs for the required behavior.

## Goals / Non-Goals

**Goals:**

- Preserve the full-viewport canvas and four-corner visual composition in both
  orientations.
- Let UI controls retain normal pointer behavior while canvas gestures use the
  same movement, collision, camera, and timing path as keyboard input.
- Keep responsive changes local to the React UI layer and Babylon Lite layer.

**Non-Goals:**

- Add an on-screen joystick, change keyboard mappings or timing, alter world
  generation, or change palette persistence and glyph inventory.
- Add responsive behavior to the unrelated GPU-lighting change.

## Decisions

### Use layout constraints rather than orientation-specific fixed dimensions

The UI stylesheet will make the dialog inset, palette grid columns, card
content, and lower-left HUD sizing responsive to available viewport space.
The HUD will reduce its spacing and type treatment only when needed to fit,
without making the lower-left region scrollable. Palette content remains the
only scrollable region within its own framed window.

Alternative considered: support named device resolutions with fixed
breakpoints. Rejected because the requirement is orientation behavior, not a
small set of exact sizes.

### Keep gesture input on the canvas and normalize it into held movement state

The game canvas will own pointer down, move, up, cancel, and capture-loss
handling. Once a movement threshold is crossed, the displacement angle will be
quantized to one of eight unit directions. Touch state will be merged with the
existing keyboard-held state before movement is resolved, allowing one repeat
timer to preserve the current immediate/250ms/125ms cadence and preventing a
touch release from clearing held keyboard movement.

Alternative considered: a separate touch-only movement timer. Rejected because
it could drift from keyboard collision, camera, and time behavior.

### Cancel touch state on geometry and lifecycle interruption

Resize, orientation change, pointer cancellation, pointer-capture loss,
page-hide, and disposal will clear only touch-held input and its pending repeat
when no keyboard movement remains. The canvas will suppress browser gesture
handling only for its own movement surface; React controls continue to receive
their native interactions.

Alternative considered: recalculate the direction after resize. Rejected
because the original gesture geometry no longer describes a reliable intent.

## Risks / Trade-offs

- [Very short landscape frames reduce available HUD space] -> Compact the HUD
  only as needed and verify every lower-left control remains visible.
- [Pointer gestures can conflict with browser scrolling] -> Limit
  `touch-action` and pointer capture to the canvas, never the UI layer.
- [Keyboard and touch can overlap] -> Treat them as independent held sources
  and clear a source only through that source's release path.

## Migration Plan

No persisted data migration is required. Reverting the UI rules restores the
prior layout; removing the canvas listeners restores keyboard-only movement.
