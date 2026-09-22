# Proposal

## Why

The current four-corner React HUD preserves its structure at different browser
zooms, but the supplied Chrome captures show that its usable density and empty
space vary sharply between 80%, 100%, and 125%. The preferred 100% Chrome
presentation should become the visual baseline while ordinary browser zoom,
Windows display scaling, narrow desktop windows, and mobile viewports reflow
the interface into a usable composition instead of depending on fixed pixel
geometry.

## What Changes

- Establish a viewport-resilient React HUD layout with bounded fluid tokens for
  margins, panel sizes, typography, spacing, and controls.
- Preserve the 100% Chrome landscape visual hierarchy: Character and minimap
  occupy matching top panels; quest, developer controls, status, and log
  remain in their established corner roles; the world remains the focal area.
- Reflow rather than clip or merely shrink HUD content at constrained width or
  height, including browser zoom from 80% through 125% and portrait/mobile
  viewports.
- Make all React-owned windows, dialogs, tooltips, developer controls, and
  scrollable surfaces follow the same sizing, safe inset, focus, and overflow
  rules.
- Keep the existing React-to-game bridge and gameplay ownership unchanged; this
  is a React markup/CSS layout and presentation change, not a world-rendering
  redesign.
- Add focused layout checks and a documented manual Chrome viewport/zoom matrix
  so the preferred 100% baseline and resilient alternatives are verifiable.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `responsive-ui-layout`: Extend the responsive UI contract to define the
  100%-zoom baseline, usable reflow at common zoom and viewport constraints,
  and consistent behavior for all React-owned HUD and window surfaces.

## Impact

- Affected code: `ascii-rpg/src/client/ui-layer-react/App.jsx`,
  `HudLayouts.jsx`, and the React UI stylesheet modules (`styles.css`,
  `hud.css`, `character.css`, `map.css`, `windows.css`, `toasts.css`, and
  `floating-text.css`) as needed.
- Affected verification: existing Node UI tests plus focused browser/manual
  checks; no Playwright test files are introduced by default.
- No new dependencies, public APIs, persistence keys, or changes to Babylon
  Lite world-state ownership are expected.
