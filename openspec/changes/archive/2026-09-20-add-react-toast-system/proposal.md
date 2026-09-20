# Proposal

## Why

Players and developers need concise, non-blocking feedback without adding a
dialog or coupling UI feedback to the Babylon game layer. The Settings panel
also needs a built-in way to exercise that feedback path.

## What Changes

- Add a reusable React toast provider and enqueue hook for UI-owned, text-only
  notifications.
- Reserve equal responsive top-corner panel footprints for the HUD and minimap,
  then render one non-interactive toast in the centered gap between them at the
  shared top inset. It enters from above the viewport over 250 ms, remains
  visible for 3 seconds, and exits upward over 250 ms after the queue is
  drained.
- Give portrait layouts a three-times-taller minimum toast area so longer
  messages can wrap without leaving the centered lane.
- At desktop landscape widths, cap that centered lane at 920 px instead of
  stretching it across the full space between the corner panels.
- Process toast requests FIFO. While a toast is visible, each queued message
  replaces it immediately after its 3-second hold and begins a new hold without
  an intervening animation. A request during the final exit cancels that exit
  and begins a new hold immediately.
- Add the `Send Toast` Settings action, with its existing-style hover help, to
  enqueue a `Test toast` message.
- Add focused Node tests for queue and timing transitions, and retain the
  existing build and manual browser verification paths.

## Capabilities

### New Capabilities

- `toast-notifications`: Provides accessible, top-centered React toast display,
  animation, timing, and FIFO queue behavior.

### Modified Capabilities

- `settings-tooltips`: Requires the new Send Toast action to expose concise
  hover and focus help alongside the existing Settings controls.

## Impact

- Affected UI: `ascii-rpg/src/runtime/ui-layer-react/App.jsx`, new UI-layer
  toast component/state helper(s), and `style.css`.
- Affected tests: focused Node tests under
  `ascii-rpg/test/runtime/ui-layer-react/`, registered with the existing
  `npm.cmd test` command.
- No new dependencies, browser storage keys, Babylon game-layer behavior, or
  bridge-layer API are introduced.
