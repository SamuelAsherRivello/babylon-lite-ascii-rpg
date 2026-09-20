# Design

## Context

The React UI layer already owns DOM overlay state, Settings controls, and UI
styling; the Babylon game layer communicates through a separate bridge. The
existing UI uses React state/effects and Node's built-in test runner. See
`proposal.md` for motivation and the toast-notifications delta for behavior.

## Goals / Non-Goals

**Goals:**

- Keep notification ownership entirely in the React UI layer.
- Give any React descendant a small, reusable enqueue interface.
- Make the timing and queue transitions deterministic and focused-testable.
- Preserve the existing dark visual language and Settings hover-help pattern.

**Non-Goals:**

- No Babylon, bridge-layer, game-loop, or cross-tab notification API.
- No persistence, action buttons, manual dismissal, stacking, or toast history.
- No third-party toast or animation dependency.

## Decisions

### React provider, hook, and viewport

Add a UI-layer toast provider around the existing application composition, a
hook that exposes an enqueue operation to React callers, and a single viewport
component that renders the active message. This keeps the feature reusable
without exposing UI state across the bridge-layer boundary. The Settings action
uses the hook to enqueue the literal `Test toast` message.

Keeping the queue directly in `App.jsx` was considered, but would make the
requested reusable React system unavailable to future React components.
Adding a bridge API was rejected because no non-React caller is in scope.

### Explicit lifecycle state and FIFO queue

Represent an active message, pending FIFO messages, and a lifecycle phase:
entering, visible, or exiting. A transition helper owns the state-machine
rules, while React effects own cancellable 250 ms and 3-second timers. At the
end of a visible hold, promote the oldest pending message in place and restart
the hold; otherwise start exit. Enqueueing while exiting immediately replaces
the active message and returns to visible, cancelling the stale exit timer.

An array of independently timed toast components was considered but rejected:
it produces stacked toasts and makes the required no-animation content swap
harder to guarantee. The state helper also permits Node tests to cover timing
rules without requiring browser automation.

### Presentation and accessibility

Use one shared responsive size for the upper-left HUD footprint and minimap.
Render the toast in the DOM overlay with a z-index above tooltips, fixed
positioning between those panels, and no pointer interaction. Its top position
inherits the shared HUD inset, while CSS transforms animate it from fully above
the viewport into the centered gap and back over 250 ms; the active message
uses a polite status role. The toast inherits the existing dark gray,
light-text, bordered visual treatment.

In portrait orientation, a 98 px minimum height provides three times the
normal toast height and uses centered grid placement so longer messages can
wrap without changing queue behavior.

In landscape viewports at least 1024 px wide, the same lane is centered and
capped at 920 px. This avoids using the entire open desktop span while the
lane still shrinks to stay between the corner panels at narrower widths.

This deliberately favors predictable unobtrusive feedback over a close button
or pointer behavior that would complicate queue semantics.

### Settings integration and verification

Add `Send Toast` using the existing `settings_option` and
`SettingTooltipTarget` conventions, plus a short action description in the
settings help map. Add focused Node tests for first-message activation, FIFO
promotion, final exit, and exit cancellation. Register the test in the existing
Node test command, then run the repository tests, production build, and manual
browser verification; Playwright remains out of scope under the repository
policy.

## Risks / Trade-offs

- [Stale timers after content replacement or unmount] -> Effects clean up every
  timer and state transitions validate the current lifecycle before advancing.
- [Toast overlaps top HUD content] -> The toast is deliberately top-centered,
  visually compact, and non-interactive, preserving the requested location.
- [Animation reduced by user preference] -> Respect browser reduced-motion
  preferences while preserving the same lifecycle order and visible duration.

## Migration Plan

1. Add the UI-only provider, lifecycle helper, viewport, styles, and Settings
   trigger.
2. Run the focused Node test, complete repository test suite, and build.
3. Manually verify single, repeated, and exit-interruption trigger sequences in
   desktop and narrow viewports.

Rollback is removal of the UI-only additions; no stored data or game-state
migration is required.
