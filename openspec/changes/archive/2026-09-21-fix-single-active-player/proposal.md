# Proposal

## Why

When a session starts in one realm and the player transfers through paired
stairs, the destination realm can still contain its generated start-cell `P`.
The arriving player is then rendered at the paired stair while the stale start
marker remains visible, producing a non-interactive duplicate player. This
violates the game's one-player interaction model and is especially visible
when travelling from Underground to Overground.

## What Changes

- Make the active player position the only source of the player glyph during
  realm activation and transfer.
- Remove any generated or stale player marker from the destination realm before
  placing the arriving player at the paired stair or selected arrival cell.
- Preserve the existing paired-stair coordinates, player movement, realm
  persistence, fog-of-war state, camera preservation, and transition timing.
- Add focused tests proving that initial startup and both directions of realm
  transfer render exactly one player and that the rendered player is the
  controllable player position.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `world-realms`: A world with two realms SHALL maintain exactly one rendered
  player at the active realm's authoritative player position after startup and
  every realm transfer.
- `game-layer-architecture`: Babylon Lite SHALL keep the active player's
  rendered marker authoritative and SHALL not leave stale player markers in a
  realm presentation when the player is transferred or reactivated.

## Impact

- `ascii-rpg/src/client/game-layer-babylon-lite/index.js` realm activation
  and player-marker handling.
- `ascii-rpg/src/client/game-layer-babylon-lite/systems/world-system.js` or a
  focused helper for normalizing player overlays, if needed by the verified
  implementation.
- Mirrored Node tests under
  `ascii-rpg/test/client/game-layer-babylon-lite/` for world/realm state and
  rendering behavior.
- No new dependency, bridge API, React UI change, or persistence migration.
