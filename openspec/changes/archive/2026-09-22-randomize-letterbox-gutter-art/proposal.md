# Proposal

## Why

Desktop Portrait mode currently surrounds the 9:16 test frame with a fixed forest-gate image. The supplied Mossy torch-lit ruins and subtle chained-brick dungeon layouts should instead provide visual variety without changing the existing gutter composition or game frame.

## What Changes

- Add the two supplied layout PNGs as assets owned by this repository.
- Select one layout randomly once per page load for the existing desktop Portrait gutters.
- Preserve the selected layout while Aspect, fullscreen, HUD visibility, and viewport size change during that page load.
- Retain the existing CSS composition, rails, borders, shadows, 9:16 frame, desktop-only eligibility, and mobile/landscape behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `responsive-ui-layout`: Replace the fixed forest-gate gutter artwork with a random page-load choice between the two supplied layouts.

## Impact

- Affected code: application bootstrap, portrait presentation CSS, and focused source tests.
- Affected assets: two supplied PNGs in the existing letterbox asset folder.
- No dependencies, player-facing settings, gameplay behavior, or mobile viewport overrides.
