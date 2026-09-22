# Proposal

## Why

The Settings controls show their current labels and values, but do not explain what a click changes. The `R`, `M`, and `F` values on Torch and Player lighting, and `O` and `B` on their Shadow controls, are especially hard to interpret without a key.

## What Changes

- Add short hover explanations to every interactive control in Settings: Fullscreen, Camera, Torch and Player lighting, Torch and Player Shadow, Ambient `+` and `-`, Zoom `+` and `-`, and Reset Settings.
- Give Torch and Player lighting a one-word key for `R` Radius, `M` Maximum, and `F` Falloff. Give Torch and Player Shadow a one-word key for `O` Occlusion and `B` Bleed. Explain that Ambient runs from `0` (dark) to `1` (bright).
- Keep the existing button labels, value formats, actions, and saved settings behavior. The Windows launchers are outside this Settings-only change.

## Capabilities

### New Capabilities

- `settings-tooltips`: Concise hover help for Settings controls, including the lighting value key.

### Modified Capabilities

None. The camera, lighting, zoom, and reset behavior specified by existing capabilities remains unchanged.

## Impact

- UI layer: `ascii-rpg/src/client/ui-layer-react/App.jsx` and its styling in `style.css`.
- Verification: focused UI checks, the repository Node test suite and build, plus a manual hover check at desktop and narrow viewport widths.
- No new dependency, game-layer behavior, bridge API, saved-data format, or external service is expected.
