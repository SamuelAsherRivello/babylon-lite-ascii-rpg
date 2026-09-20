# Proposal

## Why

The game currently gives a player no guided first interaction. A short,
acknowledgeable movement tutorial will explain the existing keyboard and swipe
controls, then provide a clear completion state after the player demonstrates
movement in every cardinal direction.

## What Changes

- Show a non-modal floating window when a new game session opens, reusing the
  existing Lighting window visual language.
- Give the first window the exact title `How To Play`, the exact instruction
  `Use arrow keys or swipe to move. Hold to move faster.`, a primary `Next`
  button, and a secondary `Skip Tutorial` button below it. It has no close
  `X` button.
- Keep the first tutorial window visible until the player clicks `Next`; after
  that, gameplay input remains available and the tutorial tracks successful
  movement in north, south, east, and west directions.
- Open a second tutorial window as soon as all four cardinal directions have
  been successfully demonstrated. Give it the exact title `Tutorial Complete`
  and an `OK` action, then finish the tutorial when the player dismisses it.
- Persist the opt-out choice when the player clicks `Skip Tutorial`; the
  current tutorial closes and future sessions do not show it.
- Ensure tutorial controls consume their own UI interactions without starting
  or interfering with game movement, and remain usable on desktop and mobile
  viewports.
- Show the tutorial at the start of each new page/game session unless the
  persisted skip choice has been enabled; no separate Settings toggle is
  required.

## Capabilities

### New Capabilities

- `movement-tutorial`: Provides the two-step introductory movement tutorial,
  its dialog/window behavior, and cardinal movement completion tracking.

### Modified Capabilities

- `game-layer-architecture`: Extends the narrow UI-to-game communication
  contract with generic successful-cardinal-movement events that let React
  track tutorial progress without owning movement.
- `responsive-ui-layout`: Extends responsive window geometry requirements to
  cover the tutorial windows and their title, instruction, opt-out checkbox,
  and `OK` controls.

## Impact

- Affected React UI: `ascii-rpg/src/runtime/ui-layer-react/App.jsx` and its
  existing UI stylesheet/components.
- Affected bridge/game integration: the narrow bridge and Babylon Lite
  movement lifecycle, adding generic `player moved up`, `player moved down`,
  `player moved left`, and `player moved right` events at successful movement
  points without adding tutorial logic to gameplay or changing collision,
  timing, swipe, or keyboard rules.
- Affected structural coverage: focused Node tests under `ascii-rpg/test/`.
- No new dependencies, save-data format, gameplay rule, or Playwright test is
  required.
