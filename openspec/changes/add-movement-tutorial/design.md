# Design

## Context

See `proposal.md` for motivation and user-visible scope. The React UI already
owns HTML windows and the existing Lighting window provides the requested
floating-window visual language. Babylon Lite owns keyboard, swipe, collision,
movement timing, and player state; the bridge is the established boundary for
deliberate UI/game communication.

## Goals / Non-Goals

**Goals:**

- Add a reusable two-state tutorial window flow in the React UI.
- Keep the exact user-facing copy and action sequence from the proposal,
  including primary `Next` and secondary `Skip Tutorial` actions.
- Count only successful cardinal movement after the first window is dismissed.
- Report just enough movement information through the bridge for the UI to
  track four-direction progress without exposing game state.
- Keep the windows non-modal to gameplay and reachable on the supported
  desktop/mobile presentations.

**Non-Goals:**

- Change movement, collision, swipe thresholds, held-repeat timing, camera
  behavior, or world generation.
- Persist only the explicit `Skip Tutorial` preference; do not persist tutorial
  progress or window position.
- Add a tutorial editor, a general quest system, or additional tutorial steps.
- Add a new dependency or Playwright coverage.

## Decisions

### Model the flow as explicit UI phases

React will represent the tutorial as an explicit phase such as initial,
tracking, complete, or finished. The initial phase renders the instruction
window; only clicking `Next` transitions to tracking. The first successful
movement in each cardinal direction updates a four-direction set. When the set
is complete, the phase changes to complete and renders the second window.
Using explicit phases avoids inferring whether the first dialog was dismissed
from incidental movement and prevents the completion dialog from reopening
after it has been dismissed.

### Reuse the Lighting window frame and text treatment

The tutorial surface will reuse the existing Lighting window frame, title-bar
layout, compact responsive constraints, and corner text classes. The How To
Play window exposes primary `Next` and secondary `Skip Tutorial` buttons; the
completion window exposes `OK`. Neither window has a close `X` or other
dismissal path. A backdrop and modal focus trap
are excluded because the requested window is a floating, non-modal game
surface.

The skip action is a user-facing persisted setting. An absent skip value is
false; activating `Skip Tutorial` stores true, finishes the current tutorial,
and suppresses later sessions. `Next` stores false and begins tracking.

### Dispatch generic movement events at the authoritative success point

The Babylon Lite movement path will dispatch one of four generic events—`player
moved up`, `player moved down`, `player moved left`, or `player moved right`—
only after a cardinal move succeeds. Keyboard and swipe paths will converge on
that same successful-movement dispatch point, so blocked attempts and
diagonal steps cannot falsely advance the tutorial. The event mechanism will
be generic and reusable; it will not mention the tutorial or hold tutorial
progress. The React tutorial will subscribe to these events and will not
receive player coordinates or a mutable movement controller.

This event boundary is preferred over a tutorial callback or tutorial-specific
bridge command because the game should publish what happened, while separate
UI systems decide whether they care. If the project already has a runtime
event bus, use it; otherwise add the smallest generic dispatch/listener
surface at the existing UI/game boundary without embedding tutorial imports in
gameplay modules.

### Make the tutorial actions the only dismissal paths

The first and completion windows will have no close button. The first
window's `Next` transitions to tracking. `Skip Tutorial` transitions directly
to finished and persists the skip. The completion window's `OK` transitions to
finished. These are the only dismissal actions.

### Keep tutorial controls outside the canvas input surface

The tutorial window will be rendered as UI-layer HTML above the canvas, and
its controls will stop their own pointer interaction from reaching the canvas.
This preserves the existing rule that UI interaction must not start player
movement or a swipe gesture.

## Risks / Trade-offs

- [The movement code may have multiple keyboard and swipe success paths] →
  identify the shared successful movement commit point and dispatch the same
  generic player-moved event there rather than adding independent tutorial
  listeners to input paths.
- [A generic movement event could arrive while the first dialog is still open]
  → the tutorial ignores events until it enters the tracking phase; checkbox
  and `OK` controls remain isolated from canvas input.
- [The completion dialog could recur after re-render or duplicate bridge
  delivery] → make the four-direction set and tutorial phase monotonic for the
  current session, and guard the transition to completion.
- [Small portrait viewports may clip the instruction] → use the Lighting
  window's compact responsive sizing and verify the title, copy, and actions at
  the project’s existing portrait test presentation.

## Migration Plan

Implementation adds the tutorial UI, its persisted opt-out key, and a narrow
movement notification, then verifies the existing Node tests, Vite build, and
manual desktop/mobile behavior. Rollback removes the new tutorial surface and
notification path; the opt-out key can remain harmlessly unused because it is
not gameplay state.
