# Proposal

## Why

Traps currently remove only two health points and the game has no explicit player-death state. As a result, reaching zero health does not produce a clear lifecycle transition or a reliable way for the player to restart the run.

## What Changes

- Increase the Trap health consequence from `-2` to `-25` and preserve the health floor at `0`.
- Add an authoritative player-death transition when health reaches `0` or below.
- Stop player movement and further gameplay consequences after death.
- Publish death state through the existing narrow game-to-UI bridge.
- Show a tutorial-format modal titled `Adventure` with body text `You have died.`, the exact summary bullets `XP: 00`, `Gold: 00`, and `Time: 00`, and a `Restart Game` button.
- Restart the game session when the player activates `Restart Game`.
- Add focused client and UI contract coverage for trap damage, zero-health clamping, death gating, and exact modal copy.

## Capabilities

### New Capabilities

- `player-lifecycle`: Defines authoritative health depletion, player death, post-death input/consequence gating, death-state publication, and the restart prompt.

### Modified Capabilities

- `object-spawner-system`: Changes the initial Trap consequence and player-facing Trap log from `-2` health to `-25` health.
- `game-layer-architecture`: Extends the narrow bridge contract with an immutable player-death state while keeping health, lifecycle, input, and gameplay ownership in Babylon Lite.

## Impact

- Babylon Lite object catalog and client object effects under `ascii-rpg/src/client/game-layer-babylon-lite/`.
- The game bridge and startup subscriptions under `ascii-rpg/src/client/bridge-layer/` and `ascii-rpg/src/main.jsx`.
- React UI modal composition and responsive window styling under `ascii-rpg/src/client/ui-layer-react/`.
- Mirrored Node tests under `ascii-rpg/test/` and the new delta specs under this change.
- No new dependency is required; restart uses the browser session reload path.
