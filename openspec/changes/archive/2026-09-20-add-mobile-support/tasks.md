# Tasks

## 1. Responsive UI layout

- [x] 1.1 Make the palette window, controls, Group grid, glyph cards, and Font
  editor responsive to available portrait and landscape space; verify focused
  UI/source tests cover contained glyph cards and visible Font actions.
- [x] 1.2 Add short-landscape HUD compaction that keeps every four-corner
  region, Windows action, and Settings action within the shared margins without
  scrolling; verify responsive layout checks cover the constrained landscape
  state.

## 2. Canvas swipe movement

- [x] 2.1 Add a tested pure gesture-direction conversion that maps thresholded
  displacement to the nearest of eight unit directions; verify cardinal and
  diagonal boundary cases in player-grid tests.
- [x] 2.2 Integrate canvas pointer capture and touch-held input with the shared
  keyboard movement/repeat path; verify immediate movement, the existing
  250ms/125ms cadence, collision/time behavior, and independent keyboard input
  remain correct.
- [x] 2.3 Cancel and clean up touch state on pointer release, cancellation,
  capture loss, resize/orientation changes, page hide, and game disposal; verify
  focused runtime tests cover each stop path and UI controls cannot start a
  movement gesture.

## 3. Validation

- [x] 3.1 Run `npm.cmd test` and `npm.cmd run build` from the repository root
  and verify both complete successfully.
- [x] 3.2 Manually verify the local Vite game in representative portrait and
  landscape orientations: all four HUD margins, palette Group cards, Font
  editor controls, canvas swipe/release/hold behavior, and normal UI taps.
