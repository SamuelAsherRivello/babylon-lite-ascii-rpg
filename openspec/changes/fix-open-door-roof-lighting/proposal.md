# Proposal

## Why

Opening a Home Door correctly makes the entrance walkable and allows grid light to travel through it, but the concealed interior is still rendered as roof tiles while the player remains outside. This causes player and torch lighting, including the optional GPU glow, to appear on the roof after the Door is opened.

## What Changes

- Keep an opened Home Door transparent to normal grid-light transport and preserve its existing movement and unlock behavior.
- Render exterior roof-cover cells with ambient-only base lighting while the player is outside the associated Building, even if sources can reach the concealed interior through an open Door.
- Exclude those same concealed roof-cover cells from the optional GPU light composite.
- Restore normal base and GPU lighting for the Home interior when the player enters its Door cell or interior and the roof presentation is replaced with the interior presentation.
- Add focused Node coverage for the outside, opened-door, and entered-Building lighting states.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `palette-grid-lighting`: constrain base and GPU lighting presentation for concealed Home roof cells without changing terrain light transport.
- `overworld-buildings`: define the lighting behavior of a Building's exterior and revealed interior presentation across the Door lifecycle.

## Impact

- Affected systems: Building presentation lookup, Babylon Lite world-cell rendering, and GPU light-pass sample submission.
- Affected tests: focused building and lighting/rendering Node tests.
- No public API, persistence, dependency, world-generation, collision, or movement changes.
