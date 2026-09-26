# Proposal

## Why

Bomb placement is already wired to SPACE and has a complete timed-explosion lifecycle, but it currently plants at the player's own cell and uses a generic dot glyph. Players need to be able to deliberately place a recognizable bomb in front of their movement heading without occupying their own tile.

## What Changes

- Add a reusable cardinal heading-location contract derived from the player's last successful cardinal movement.
- Change the SPACE bomb action to target that heading location rather than the player's current cell.
- Render a planted bomb as `💣`; when it detonates, render the existing `✶` explosion glyph at that cell.
- Preserve existing inventory consumption, fuse, blast, damage, movement-over-bomb, and chain-reaction behavior.
- Record a deterministic diagonal policy: a diagonal movement does not replace the most recent cardinal heading; without a prior cardinal heading, placement fails without consuming a bomb.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `bombs`: place the SPACE-triggered bomb at the reusable heading location and use the bomb glyph before the existing explosion glyph replaces it.
- `player-grid-movement`: retain the player's latest successful cardinal movement as a cardinal heading location for other gameplay systems.

## Impact

- Affected game-layer input and player-movement state, bomb action targeting, bomb glyph rendering, and focused Node tests.
- No new dependencies, persistence changes, or renderer replacement.
