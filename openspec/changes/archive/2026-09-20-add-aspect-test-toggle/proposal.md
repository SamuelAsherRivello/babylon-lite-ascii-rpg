# Proposal

## Why

Desktop testing currently depends on manually changing browser dimensions to
exercise the mobile layout, which is inconvenient and can bypass the game's
own responsive behavior. A persistent in-game aspect setting will let desktop
users switch between the normal landscape presentation and a predictable
portrait test presentation without treating physical mobile browsers the same
as desktop.

## What Changes

- Add a Settings toggle whose default, exact visible label is
  `Aspect (Landscape)`; activating it switches the displayed state to portrait,
  and activating it again returns to landscape.
- In landscape, make the game presentation fill the available browser viewport
  while ensuring its effective content frame is wider than tall.
- In portrait on desktop, present the game through a 9:16 test frame so a PC
  can exercise the portrait mode; on mobile, retain viewport-filling behavior
  instead of forcing a fixed aspect-ratio frame.
- Persist the selected aspect mode in local storage, initialize first-time
  sessions to landscape, and include it in Reset Settings.
- Add repository agent guidance that future mobile-friendly testing must use
  this setting rather than hardcoding viewport dimensions or introducing other
  screen-size test hacks.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `responsive-ui-layout`: Define the selectable landscape and portrait
  presentation frames while retaining usable HUD and canvas behavior.
- `settings-tooltips`: Include the new persisted aspect control in the Settings
  interaction and hover-explanation contract.

## Impact

- Affects the React UI layer and responsive CSS in `ascii-rpg/src/client/ui-layer-react/`,
  plus focused Node tests in `ascii-rpg/test/`.
- Updates the repository `AGENTS.md` guidance for future agent-driven testing.
- Adds no dependencies and does not alter the Babylon game-layer ownership of
  the canvas.
