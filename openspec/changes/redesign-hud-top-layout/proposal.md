# Proposal

## Why

The current HUD uses the upper-left corner for mixed world/realm/time text and reserves the upper-right corner as an empty region. The game needs a clearer top-of-screen layout that establishes two equal HUD boxes now, while leaving the future contents of the character box open for the next design request.

## What Changes

- Replace the current upper-left HUD presentation with a bordered Character box.
- Use the upper-right HUD region as a bordered Minimap box.
- Give both top boxes the same dimensions, border treatment, inset, and responsive behavior.
- Keep the minimap status text visible in the upper-right box as `W: 1`, `F: -1`, and `Time: 0001`.
- Interpret floor `-1` as Underground and floor `1` as Overground when mapping realm state to the floor indicator.
- Do not define the detailed contents or controls of the Character box in this change.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `responsive-ui-layout`: Change the top HUD from independent corner content to two matching bordered boxes in the upper-left and upper-right positions.
- `time-system`: Move the time readout into the Minimap box and use the requested four-digit zero-padded presentation for this HUD layout.
- `world-realms`: Represent the active Overground/Underground realm in the Minimap box as floor `1`/`-1`.

## Impact

- React HUD markup in `ascii-rpg/src/runtime/ui-layer-react/App.jsx`.
- Shared HUD geometry and border rules in `ascii-rpg/src/runtime/ui-layer-react/style.css`.
- UI-facing realm and time formatting, while preserving existing game-layer realm and time state.
- Existing structural and runtime tests that assert the four-corner layout or exact time location will need updates during implementation.
- No new dependencies or persistence keys are required.
