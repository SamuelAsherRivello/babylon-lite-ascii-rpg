# Design

## Context

The game layer currently stores log strings in `index.js`, exposes them through
game-controller callbacks, and forwards them through `game-bridge.js` to the
React Log panel. The Log panel renders the snapshot in a scrollable body but
does not currently preserve a deliberate follow-bottom versus reading-history
state. Systems are already organized under `systems/`, with `.js` modules and
mirrored runtime tests.

## Goals / Non-Goals

**Goals:**

- Introduce a reusable game-layer Log System with an event intake and a clear
  display-policy boundary.
- Preserve the current string messages, eight-line default retention, and
  bridge snapshot shape unless normalization requires a safe copy.
- Make Log scrolling deterministic across new React snapshots, user wheel/touch
  scrolling, and collapse/expand transitions.
- Keep game systems independent from React and HTML concerns.

**Non-Goals:**

- No persistent log history, save-file integration, network logging, or
  cross-session restoration.
- No new Log filtering UI or per-category controls in this change.
- No replacement of the existing narrow bridge with a direct event bus between
  React and Babylon Lite.
- No change to the existing lower-right layout, collapse affordance, or panel
  visual design.

## Decisions

1. **Create `systems/log-system.js` as the authoritative log owner.**

   The module will own event validation, message normalization, display-policy
   evaluation, bounded history, snapshots, and subscribers. `index.js` will
   instantiate it and pass the system's event method to gameplay paths. This
   is preferable to leaving another `appendLog` closure in the index because
   independent systems can receive the same narrow dependency without knowing
   about UI or bridge storage.

2. **Use a message-first event contract with optional metadata.**

   The required field is a message; optional metadata is reserved for future
   display policy such as category or severity. The default formatter renders
   the normalized message alone, preserving current user-visible strings.
   Events with missing or empty normalized messages are ignored. This keeps
   the first API small while allowing the Log System—not callers—to decide
   whether an event becomes visible.

3. **Keep the bridge snapshot as ordered strings.**

   The Log System will expose immutable copies of its rendered line history to
   the existing game-controller and `game-bridge.js` snapshot path. React does
   not need event metadata for the requested UI and continuing to expose only
   rendered lines preserves the established narrow boundary.

4. **Inject the Log System into game systems through callbacks/dependencies.**

   Existing realm and pickup paths will call the Log System's event method;
   they will not import React, the bridge, or the UI component. A direct global
   singleton was rejected because it would make tests and future game-instance
   replacement share mutable history.

5. **Track follow-bottom state in the React Log body.**

   The body will measure bottom proximity using `scrollHeight -
   scrollTop - clientHeight` with a small pixel tolerance. Before a snapshot
   update, the UI records whether it was at the bottom; after the new lines
   render, it sets `scrollTop = scrollHeight` only when that flag was true.
   Scroll events update the flag, so scrolling upward pauses autoscroll and
   returning to the bottom resumes it. This is preferable to always assigning
   `scrollTop` after render, which prevents reading older entries.

6. **Preserve the current Log component and panel contract.**

   The existing `logOpen`, `log_box`, `log_box_body`, action button, collapse
   behavior, and bridge subscription remain in place. The implementation may
   split the Log body into a focused React component if that makes the effect
   lifecycle testable, but it will not move game log ownership into React.

## Risks / Trade-offs

- **[Scroll measurements occur before the DOM has finished laying out]** ->
  Use a layout-timed effect or equivalent post-render measurement and guard
  against an unmounted body ref.
- **[A user scrolls during a snapshot render]** -> Update follow-bottom state
  from the body's scroll event and only apply the pending autoscroll when the
  recorded pre-update state was at bottom.
- **[Event normalization changes existing message text]** -> Keep the default
  formatter message-first, replace line breaks with spaces only, and add tests
  for current realm and pickup messages.
- **[Multiple game instances leak subscriptions]** -> Expose unsubscribe
  functions and dispose the Log System with its owning game controller.

## Migration Plan

1. Add and unit-test the standalone Log System.
2. Wire it into Babylon Lite startup and replace current `appendLog` calls.
3. Keep the existing controller-to-bridge snapshot forwarding, changing only
   its source to the new system.
4. Add the React bottom-follow behavior and focused tests.
5. Run the full existing test suite, production build, and manual Log panel
   verification with both follow-bottom and reading-history states.

Rollback is a scoped source revert; no persisted data or external migration is
required.
