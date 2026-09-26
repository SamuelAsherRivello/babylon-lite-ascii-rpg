# Proposal

## Why

An in-world health bar records the cell where damage occurred, so it can remain at that old cell while its damaged enemy continues moving. This breaks the expected world-space relationship between a visible enemy and its active health feedback.

## What Changes

- Make every active non-player in-world health bar resolve and render from its associated entity's current world cell on each presentation update.
- Keep the existing health-bar timing, fill, damage-delta segment, visibility, and gameplay-neutral behavior unchanged while the entity moves.
- Hide rather than leave a stale bar if its associated entity is no longer present, is outside the active realm or visible region, or is obscured by fog.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `in-world-health-bars`: Require active health bars to follow the current cell of their associated rendered entity.

## Impact

- Affected code: the Babylon Lite health-bar state and overlay-rendering path, plus focused health-bar tests.
- Affected behavior: visible, damaged enemies that move during an active health-bar interval.
- No new dependencies, persistence, APIs, gameplay rules, or floating-text behavior.
