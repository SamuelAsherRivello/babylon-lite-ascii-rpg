# Proposal

## Why

The game currently applies one set of defaults to every browser and requires a
separate Fullscreen action. Mobile players need a larger initial map view and a
cleaner, immersive entry while desktop behavior stays unchanged.

## What Changes

- Select default setting values by platform when a setting has no saved
  `localStorage` value: PC retains the current defaults; Mobile copies those
  defaults except that Zoom begins at `7` and Show UI begins off.
- Preserve a player's saved settings across later loads; platform defaults do
  not overwrite an existing choice.
- On each mobile page load, use the first eligible user click to request
  fullscreen once, without blocking the click's normal game/UI action or
  retrying after a browser rejects the request.
- Keep the current desktop fullscreen toggle and all current desktop default
  values unchanged.

## Capabilities

### New Capabilities

- `platform-default-settings`: Platform-aware first-run settings and mobile
  first-interaction fullscreen behavior.

### Modified Capabilities

- `zoom-levels`: The initial zoom requirement gains a mobile-specific default.

## Impact

- Affected code: React UI settings initialization, persistence, fullscreen
  event handling, and focused Node tests.
- Affected behavior: first-time mobile sessions start at zoom `7` with the HUD
  hidden and request fullscreen on their first click; PC remains at zoom `5`
  with the HUD visible.
- No API, dependency, or deployment changes are expected.
