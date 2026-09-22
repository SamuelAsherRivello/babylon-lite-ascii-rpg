# Proposal

## Why

Desktop Portrait mode currently centers a 9:16 RPG test frame against an
unadorned page background. A polished gate-and-forest presentation will make
that surrounding space intentional while retaining the existing game and HUD
geometry. The initial artwork is available from the related Stealth & Steel
game and may be copied into this project as an owned starting asset set.

## What Changes

- Add a non-interactive, desktop-only Portrait presentation behind and outside
  the existing 9:16 game frame.
- Copy the Stealth & Steel forest-gate backdrop and rail assets into
  RPG-owned source assets, then render the backdrop in the variable outer
  gutters and mirrored rails immediately beside the frame.
- Apply the established rail depth treatment, including borders and drop
  shadows, without resizing, covering, or changing input for the game frame
  or HUD.
- Keep the presentation visible in desktop fullscreen and when the HUD is
  hidden.
- Keep mobile portrait edge-to-edge and keep every landscape presentation
  unchanged. On narrow desktop windows, allow outer artwork to crop beyond
  the viewport rather than altering the 9:16 frame.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `responsive-ui-layout`: Define the desktop Portrait letterbox presentation
  while preserving the existing mobile and landscape presentation contract.

## Impact

- Affected code: `ascii-rpg/index.html`, portrait presentation rules in
  `ascii-rpg/src/client/ui-layer-react/map.css`, and any focused source tests
  that assert the presentation markup and CSS contract.
- Affected assets: two copied PNGs owned by the RPG project.
- No new dependencies, settings, public APIs, gameplay behavior, or mobile
  viewport overrides.
